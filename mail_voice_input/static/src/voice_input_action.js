import { registerComposerAction } from "@mail/core/common/composer_actions";
import { useState, useComponent, onWillUnmount } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { _t } from "@web/core/l10n/translation";
import { session } from "@web/session";

// Odoo uses some locale codes that are not valid BCP-47 tags supported by
// Chrome's Web Speech API (e.g. es_419 = Latin American Spanish).
// This map translates them to the closest supported locale.
const ODOO_LANG_TO_BCP47 = {
    "es_419": "es-MX",  // Latin American Spanish → Mexico (widely supported)
    "zh_CN":  "zh-CN",  // Simplified Chinese
    "zh_TW":  "zh-TW",  // Traditional Chinese
    "pt_BR":  "pt-BR",  // Brazilian Portuguese
};

/**
 * Converts an Odoo locale string (e.g. "es_ES") to BCP-47 format ("es-ES")
 * required by the Web Speech API. Falls back to the base language tag (e.g.
 * "es") if the locale is not directly supported by Chrome.
 */
function getRecognitionLang() {
    const lang = session.user_lang || session.lang || "en_US";
    if (ODOO_LANG_TO_BCP47[lang]) {
        return ODOO_LANG_TO_BCP47[lang];
    }
    // Standard conversion: es_ES → es-ES
    return lang.replace("_", "-");
}

/**
 * Custom hook that manages a SpeechRecognition instance for a Composer component.
 * Returns a reactive state object with: { isRecording, isSupported }.
 * Side-effect: appends recognised text directly into composer.composerText.
 */
function useVoiceInput() {
    const component = useComponent();
    const notification = useService("notification");

    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    const state = useState({
        isRecording: false,
        isSupported: Boolean(SpeechRecognition),
    });

    if (!SpeechRecognition) {
        return state;
    }

    /** @type {SpeechRecognition} */
    let recognition = null;

    function buildRecognition() {
        const rec = new SpeechRecognition();
        rec.lang = getRecognitionLang();
        rec.interimResults = true;   // Show text while speaking
        rec.continuous = false;      // Stop automatically after a pause

        // Track the last interim result so we can replace it with the final one
        let interimLength = 0;

        rec.onresult = (event) => {
            const composer = component.props.composer;
            let interimTranscript = "";
            let finalTranscript = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += result[0].transcript;
                } else {
                    interimTranscript += result[0].transcript;
                }
            }

            // Remove the previous interim text and append new content
            const currentText = composer.composerText || "";
            const baseText = currentText.slice(0, currentText.length - interimLength);

            if (finalTranscript) {
                // Final: append with a trailing space so the user can keep typing
                const separator = baseText && !baseText.endsWith(" ") ? " " : "";
                composer.composerText = baseText + separator + finalTranscript.trim() + " ";
                interimLength = 0;
            } else {
                // Interim: update in-place so the user sees live feedback
                composer.composerText = baseText + interimTranscript;
                interimLength = interimTranscript.length;
            }
        };

        rec.onerror = (event) => {
            state.isRecording = false;
            interimLength = 0;
            if (event.error === "not-allowed" || event.error === "service-not-allowed") {
                notification.add(
                    _t('Microphone access denied. Allow access from the browser address bar.'),
                    { type: "warning" }
                );
            } else if (event.error !== "aborted") {
                notification.add(
                    _t('Voice recognition error: %(error)s', { error: event.error }),
                    { type: "warning" }
                );
            }
        };

        rec.onend = () => {
            state.isRecording = false;
            interimLength = 0;
        };

        return rec;
    }

    function startRecording() {
        recognition = buildRecognition();
        recognition.start();
        state.isRecording = true;
    }

    function stopRecording() {
        if (recognition) {
            recognition.stop();
            recognition = null;
        }
        state.isRecording = false;
    }

    function toggle() {
        if (state.isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    }

    onWillUnmount(() => {
        if (state.isRecording) {
            stopRecording();
        }
    });

    // Expose toggle so the action can call it
    state.toggle = toggle;
    return state;
}

registerComposerAction("voice-input", {
    // Only show the button if the browser supports the Web Speech API
    condition: () => Boolean(window.SpeechRecognition || window.webkitSpeechRecognition),

    icon: "fa fa-microphone",
    name: _t("Dictate message"),

    // Position: right after the emoji button (sequenceQuick 20) and before send (30)
    sequenceQuick: 25,

    setup({ owner }) {
        owner.voiceInput = useVoiceInput();
    },

    onSelected({ owner }) {
        owner.voiceInput.toggle();
    },

    // Keep the button visually active while recording
    isActive: ({ owner }) => owner.voiceInput?.isRecording,

    btnClass: ({ action }) =>
        action.isActive ? "o-voiceInput-recording text-danger" : "",
});
