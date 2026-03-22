import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { useAnalysisStore } from "../../store/analysisStore";

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes)) return "-";
  const units = ["B", "KB", "MB", "GB"];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function Step2UploadConnect() {
  const dataSource = useAnalysisStore((s) => s.dataSource);
  const csvFile = useAnalysisStore((s) => s.csvFile);
  const apiUrl = useAnalysisStore((s) => s.apiUrl);
  const sql = useAnalysisStore((s) => s.sql);
  const nosql = useAnalysisStore((s) => s.nosql);

  const setCsvFile = useAnalysisStore((s) => s.setCsvFile);
  const setApiUrl = useAnalysisStore((s) => s.setApiUrl);
  const setSql = useAnalysisStore((s) => s.setSql);
  const setNoSql = useAnalysisStore((s) => s.setNoSql);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const title = useMemo(() => {
    if (dataSource === "csv") return "Step 2 — Upload CSV";
    if (dataSource === "api") return "Step 2 — Connect API";
    if (dataSource === "sql") return "Step 2 — Connect SQL";
    if (dataSource === "nosql") return "Step 2 — Connect NoSQL";
    return "Step 2 — Upload / Connect";
  }, [dataSource]);

  function pickFile() {
    inputRef.current?.click();
  }

  function acceptFile(f: File | null) {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please upload a .csv file.");
      return;
    }
    setCsvFile(f);
    toast.success("CSV selected.");
  }

  if (!dataSource) {
    return (
      <Card>
        <div className="text-sm font-bold text-[var(--sbpa-dark)]">Step 2</div>
        <div className="mt-1 text-sm text-[var(--sbpa-dark)]/60">Pick a data source first.</div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-black text-[var(--sbpa-dark)]">{title}</div>
        <div className="mt-1 text-sm text-[var(--sbpa-dark)]/60">
          Provide the details for the selected data source. The app will keep your file/config in memory so you don’t need to re-enter it.
        </div>
      </div>

      {dataSource === "csv" ? (
        <Card>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => acceptFile(e.target.files?.[0] ?? null)}
          />

          <div
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragging(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragging(false);
              acceptFile(e.dataTransfer.files?.[0] ?? null);
            }}
            className={[
              "rounded-3xl border-2 border-dashed p-6 transition",
              dragging ? "border-[var(--sbpa-primary)] bg-[var(--sbpa-card)]/40" : "border-[var(--sbpa-dark)]/15 bg-[var(--sbpa-card)]/40",
            ].join(" ")}
          >
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-black text-[var(--sbpa-dark)]">Drag & drop your CSV</div>
                <div className="mt-1 text-sm text-[var(--sbpa-dark)]/60">
                  Or choose a file. We’ll reuse it for the rest of the pipeline.
                </div>
              </div>
              <Button type="button" variant="secondary" onClick={pickFile}>
                Choose file
              </Button>
            </div>

            {csvFile ? (
              <div className="mt-4 rounded-2xl bg-[var(--sbpa-card)]/80 p-4 text-sm">
                <div className="font-bold text-[var(--sbpa-dark)]">Selected file</div>
                <div className="mt-1 text-[var(--sbpa-dark)]/70">
                  {csvFile.name} • {formatBytes(csvFile.size)}
                </div>
                <div className="mt-3">
                  <Button type="button" variant="ghost" onClick={() => setCsvFile(null)}>
                    Remove
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </Card>
      ) : null}

      {dataSource === "api" ? (
        <Card className="space-y-3">
          <div>
            <label className="text-sm font-semibold text-[var(--sbpa-dark)]/70">API URL</label>
            <input
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://api.example.com/data"
              className="mt-1 w-full rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)] px-3 py-2 text-sm outline-none transition focus:border-[var(--sbpa-primary)]"
            />
            <div className="mt-1 text-xs text-[var(--sbpa-dark)]/50">We’ll fetch this during the pipeline run.</div>
          </div>
        </Card>
      ) : null}

      {dataSource === "sql" ? (
        <Card className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-[var(--sbpa-dark)]/70">Engine</label>
              <select
                value={sql.engine}
                onChange={(e) => {
                  setSql({ engine: e.target.value as any });
                }}
                className="mt-1 w-full rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)] px-3 py-2 text-sm outline-none transition focus:border-[var(--sbpa-primary)]"
              >
                <option value="postgresql">PostgreSQL</option>
                <option value="mysql">MySQL Server</option>
                <option value="mssql">Microsoft SQL Server (e.g. SQLEXPRESS)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-[var(--sbpa-dark)]/70">Host</label>
              <input
                value={sql.host}
                onChange={(e) => setSql({ host: e.target.value })}
                className="mt-1 w-full rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)] px-3 py-2 text-sm outline-none transition focus:border-[var(--sbpa-primary)]"
                placeholder="localhost or 10.0.0.1"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[var(--sbpa-dark)]/70">Port or Instance name</label>
              <input
                value={sql.port}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.toUpperCase().includes("SQLEXPRESS") && sql.engine !== "mssql") {
                     setSql({ port: val, engine: "mssql" });
                  } else {
                     setSql({ port: val });
                  }
                }}
                className="mt-1 w-full rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)] px-3 py-2 text-sm outline-none transition focus:border-[var(--sbpa-primary)]"
                placeholder="e.g. 5432, 1433, or SQLEXPRESS"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[var(--sbpa-dark)]/70">Database</label>
              <input
                value={sql.database}
                onChange={(e) => setSql({ database: e.target.value })}
                className="mt-1 w-full rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)] px-3 py-2 text-sm outline-none transition focus:border-[var(--sbpa-primary)]"
                placeholder="my_db"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[var(--sbpa-dark)]/70">Username</label>
              <input
                value={sql.username}
                onChange={(e) => setSql({ username: e.target.value })}
                className="mt-1 w-full rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)] px-3 py-2 text-sm outline-none transition focus:border-[var(--sbpa-primary)]"
                placeholder="user"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-[var(--sbpa-dark)]/70">Password</label>
              <input
                value={sql.password}
                onChange={(e) => setSql({ password: e.target.value })}
                type="password"
                className="mt-1 w-full rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)] px-3 py-2 text-sm outline-none transition focus:border-[var(--sbpa-primary)]"
                placeholder="••••••••"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-[var(--sbpa-dark)]/70">Read-only query (SELECT only)</label>
              <textarea
                value={sql.query}
                onChange={(e) => setSql({ query: e.target.value })}
                className="mt-1 min-h-24 w-full rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)] px-3 py-2 text-sm outline-none transition focus:border-[var(--sbpa-primary)]"
                placeholder="SELECT * FROM your_table LIMIT 1000"
              />
              <div className="mt-1 text-xs text-[var(--sbpa-dark)]/50">
                Backend enforces SELECT-only for safety.
              </div>
            </div>
          </div>
        </Card>
      ) : null}

      {dataSource === "nosql" ? (
        <Card className="space-y-3">
          <div>
            <label className="text-sm font-semibold text-[var(--sbpa-dark)]/70">Connection string</label>
            <input
              value={nosql.connectionString}
              onChange={(e) => setNoSql({ connectionString: e.target.value })}
              placeholder="mongodb://user:pass@host:27017/db"
              className="mt-1 w-full rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)] px-3 py-2 text-sm outline-none transition focus:border-[var(--sbpa-primary)]"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-[var(--sbpa-dark)]/70">Database</label>
              <input
                value={nosql.database}
                onChange={(e) => setNoSql({ database: e.target.value })}
                className="mt-1 w-full rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)] px-3 py-2 text-sm outline-none transition focus:border-[var(--sbpa-primary)]"
                placeholder="my_db"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[var(--sbpa-dark)]/70">Collection</label>
              <input
                value={nosql.collection}
                onChange={(e) => setNoSql({ collection: e.target.value })}
                className="mt-1 w-full rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)] px-3 py-2 text-sm outline-none transition focus:border-[var(--sbpa-primary)]"
                placeholder="my_collection"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-[var(--sbpa-dark)]/70">Query (JSON)</label>
              <textarea
                value={nosql.queryJson}
                onChange={(e) => setNoSql({ queryJson: e.target.value })}
                className="mt-1 min-h-20 w-full rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)] px-3 py-2 text-sm outline-none transition focus:border-[var(--sbpa-primary)]"
                placeholder='{"status":"active"}'
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[var(--sbpa-dark)]/70">Limit</label>
              <input
                value={nosql.limit}
                onChange={(e) => setNoSql({ limit: e.target.value })}
                className="mt-1 w-full rounded-2xl border border-[var(--sbpa-dark)]/10 bg-[var(--sbpa-card)] px-3 py-2 text-sm outline-none transition focus:border-[var(--sbpa-primary)]"
                placeholder="1000"
              />
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

