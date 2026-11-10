import { useLiveQuery } from 'dexie-react-hooks';
import { TrendingUp } from 'lucide-react';
import { useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { DAY_SHORT } from '../../lib/constants';
import { getDoubleProgressionHits, getExerciseProgress } from '../../services/progression.service';
import { listExercises } from '../../services/workout.service';

export default function ProgressionPage() {
  const exercises = useLiveQuery(listExercises, []);
  const hits = useLiveQuery(getDoubleProgressionHits, []);
  const [chosen, setChosen] = useState<string>();
  const selected = chosen ?? exercises?.[0]?.id;
  const data = useLiveQuery(() => (selected ? getExerciseProgress(selected) : []), [selected]);
  const hasData = (data ?? []).some((p) => p.maxWeight !== null);

  return (
    <div className="flex flex-col gap-4">
      {hits && hits.length > 0 && (
        <Card className="border-green-300 bg-green-50 dark:border-green-900 dark:bg-green-950">
          <p className="mb-2 flex items-center gap-2 font-semibold text-green-800 dark:text-green-300">
            <TrendingUp size={18} /> Hora de subir a carga
          </p>
          <ul className="text-sm text-green-900 dark:text-green-200">
            {hits.map((e) => (
              <li key={e.id}>
                {e.name} ({DAY_SHORT[e.daySlot]}) — topo de {e.defaultReps} reps em todas as séries
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Select
        label="Exercício"
        value={selected ?? ''}
        onChange={(e) => setChosen(e.target.value)}
      >
        {(exercises ?? []).map((e) => (
          <option key={e.id} value={e.id}>
            {e.name} · {DAY_SHORT[e.daySlot]}
          </option>
        ))}
      </Select>

      <Card>
        <p className="mb-2 text-sm font-semibold">Últimas 8 semanas</p>
        {hasData ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#a1a1aa55" />
                <XAxis dataKey="week" fontSize={12} />
                <YAxis yAxisId="left" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" fontSize={12} />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="maxWeight"
                  name="Carga máx. (kg)"
                  stroke="#2563eb"
                  strokeWidth={2}
                  connectNulls
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="volume"
                  name="Volume (kg)"
                  stroke="#71717a"
                  strokeWidth={2}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Sem dados para este exercício ainda.
          </p>
        )}
      </Card>
    </div>
  );
}
