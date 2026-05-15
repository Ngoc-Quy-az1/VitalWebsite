import fs from "fs";

const p = "src/pages/HomePage.jsx";
let s = fs.readFileSync(p, "utf8");

const d = "div";

const oldBlock = `      <${d} className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-2">
        <${d} className="min-h-0">
          <VirtualAvatarPanel
            isListening={isListening}
            isSpeaking={isSpeaking}
            isThinking={isThinking}
            onStopSpeaking={handleStopSpeaking}
          />
        </${d}>`;

const newBlock = `      <section className="relative grid min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-2 xl:gap-4">
        <section
          className={\`relative min-h-0 xl:block \${showMobileAvatar ? "fixed inset-x-3 top-[5.5rem] z-40 block h-[38vh] xl:static xl:h-auto" : "hidden"}\`}
        >
          <VirtualAvatarPanel
            isListening={isListening}
            isSpeaking={isSpeaking}
            isThinking={isThinking}
            onStopSpeaking={handleStopSpeaking}
          />
          {showMobileAvatar ? (
            <button
              type="button"
              onClick={() => setShowMobileAvatar(false)}
              className="absolute -bottom-3 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-800 px-3 py-1 text-xs text-white xl:hidden"
            >
              Thu gọn avatar
            </button>
          ) : null}
        </section>`;

if (!s.includes(oldBlock)) {
  console.error("Old block not found");
  process.exit(1);
}

s = s.replace(oldBlock, newBlock);

const oldClose = `        </${d}>
      </${d}>
    </section>`;
const newClose = `        </section>
      </section>
    </section>`;

if (!s.includes(oldClose)) {
  console.error("Old close not found");
  process.exit(1);
}

s = s.replace(oldClose, newClose);

const bottomProps = `            onRemoveImage={handleRemoveImage}
          />`;
const bottomPropsNew = `            onRemoveImage={handleRemoveImage}
            quickReplies={QUICK_REPLIES}
            onQuickReply={handleQuickReply}
          />`;

if (!s.includes(bottomProps)) {
  console.error("BottomInputArea props not found");
  process.exit(1);
}

s = s.replace(bottomProps, bottomPropsNew);

fs.writeFileSync(p, s);
console.log("Patched HomePage layout");
