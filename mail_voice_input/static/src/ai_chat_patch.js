import { ComposerAction } from "@mail/core/common/composer_actions";
import { patch } from "@web/core/utils/patch";

// The `ai` module patches ComposerAction._condition to block ALL actions
// in an AI agent chat except "send-message". Since our module declares `ai`
// as a dependency, this patch is applied AFTER the ai module's patch, making
// it the outermost one — so it runs first when _condition is evaluated.
//
// We intercept "voice-input" before the ai module's restriction can return
// false, and delegate everything else to the existing chain (ai's patch →
// original implementation).
patch(ComposerAction.prototype, {
    _condition({ composer }) {
        if (this.id === "voice-input") {
            return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
        }
        return super._condition(...arguments);
    },
});
