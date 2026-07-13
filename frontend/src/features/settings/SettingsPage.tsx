import { KeyRound, LockKeyhole, SlidersHorizontal, ToggleRight } from "lucide-react";

export function SettingsPage() {
  return (
    <section className="two-column">
      <section className="table-panel">
        <span className="eyebrow">Workspace settings</span>
        <h2>Retrieval and answer behavior</h2>
        <div className="settings-list">
          <label className="setting-row">
            <span><SlidersHorizontal size={18} /> Default top K</span>
            <input value="5" readOnly />
          </label>
          <label className="setting-row">
            <span><ToggleRight size={18} /> Abstention mode</span>
            <select defaultValue="strict">
              <option value="strict">Strict evidence only</option>
              <option value="balanced">Balanced</option>
            </select>
          </label>
          <label className="setting-row">
            <span><LockKeyhole size={18} /> Citation requirement</span>
            <select defaultValue="required">
              <option value="required">Required for every answer</option>
              <option value="optional">Optional</option>
            </select>
          </label>
        </div>
      </section>
      <section className="work-panel stack-panel">
        <div>
          <span className="eyebrow">Provider keys</span>
          <h2>AI provider configuration</h2>
          <p>Keep provider keys outside the repository and inject them through environment variables or a secret manager.</p>
        </div>
        <div className="control-list single-column">
          <span><KeyRound size={17} /> Embedding provider: local demo</span>
          <span><KeyRound size={17} /> Generation provider: evidence-only local demo</span>
          <span><LockKeyhole size={17} /> Secrets: environment managed</span>
        </div>
      </section>
    </section>
  );
}
