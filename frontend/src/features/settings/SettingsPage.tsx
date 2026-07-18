import { KeyRound, LockKeyhole, SlidersHorizontal, ToggleRight } from "lucide-react";

export function SettingsPage() {
  return (
    <section className="two-column">
      <section className="table-panel">
        <span className="eyebrow">Workspace settings</span>
        <h2>Search and answer behavior</h2>
        <div className="settings-list">
          <label className="setting-row">
            <span><SlidersHorizontal size={18} /> Number of source matches</span>
            <input value="5" readOnly />
          </label>
          <label className="setting-row">
            <span><ToggleRight size={18} /> Safe no-answer mode</span>
            <select defaultValue="strict">
              <option value="strict">Only answer from documents</option>
              <option value="balanced">Balanced</option>
            </select>
          </label>
          <label className="setting-row">
            <span><LockKeyhole size={18} /> Source requirement</span>
            <select defaultValue="required">
              <option value="required">Required for every answer</option>
              <option value="optional">Optional</option>
            </select>
          </label>
        </div>
      </section>
      <section className="work-panel stack-panel">
        <div>
          <span className="eyebrow">AI keys</span>
          <h2>AI service setup</h2>
          <p>Keep AI service keys outside the codebase and store them safely in environment variables or a secret manager.</p>
        </div>
        <div className="control-list single-column">
          <span><KeyRound size={17} /> Search preparation: local demo</span>
          <span><KeyRound size={17} /> Answer generation: document-only demo</span>
          <span><LockKeyhole size={17} /> Secrets: environment managed</span>
        </div>
      </section>
    </section>
  );
}
