type Props = {
  data: {
    day_0: any;
    day_10: any;
    day_30: any;
  };
};

export default function ConsequenceCascade({ data }: Props) {
  return (
    <section className="mt-6 p-6 rounded-lg border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
      <h2 className="text-xl font-semibold text-cyan-400 mb-4">Cascade Impact Projection</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-slate-200 mb-2">Immediate (Day 0)</h3>
          <pre className="p-4 rounded bg-slate-800/50 border border-slate-700/30 text-sm text-slate-300 overflow-x-auto">
            {JSON.stringify(data.day_0, null, 2)}
          </pre>
        </div>

        <div>
          <h3 className="text-lg font-medium text-slate-200 mb-2">Secondary (Day 10)</h3>
          <pre className="p-4 rounded bg-slate-800/50 border border-slate-700/30 text-sm text-slate-300 overflow-x-auto">
            {JSON.stringify(data.day_10, null, 2)}
          </pre>
        </div>

        <div>
          <h3 className="text-lg font-medium text-slate-200 mb-2">Long Term (Day 30)</h3>
          <pre className="p-4 rounded bg-slate-800/50 border border-slate-700/30 text-sm text-slate-300 overflow-x-auto">
            {JSON.stringify(data.day_30, null, 2)}
          </pre>
        </div>
      </div>
    </section>
  );
}

