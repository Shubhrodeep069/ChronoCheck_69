import { useEffect } from "react";
import { useFeatureStorage } from "@/hooks/use-feature-storage";

const TIMEZONES = [
  { label: "🇺🇸 New York", offset: -5, id: "America/New_York" },
  { label: "🇬🇧 London", offset: 0, id: "Europe/London" },
  { label: "🇫🇷 Paris", offset: 1, id: "Europe/Paris" },
  { label: "🇮🇳 Mumbai", offset: 5.5, id: "Asia/Kolkata" },
  { label: "🇯🇵 Tokyo", offset: 9, id: "Asia/Tokyo" },
  { label: "🇦🇺 Sydney", offset: 11, id: "Australia/Sydney" },
  { label: "🇧🇷 São Paulo", offset: -3, id: "America/Sao_Paulo" },
  { label: "🇦🇪 Dubai", offset: 4, id: "Asia/Dubai" },
];

export default function TimeZoneConverter() {
  const { state, setState } = useFeatureStorage("time-zone-converter", { times: {} as Record<string, string>, inputTime: "14:00", sourceZone: 0, stats: { conversions: 0 } });
  useEffect(() => {
    const [h, m] = state.inputTime.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return;
    const sourceOffset = TIMEZONES[state.sourceZone].offset;
    const utcMinutes = h * 60 + m - sourceOffset * 60;
    const result: Record<string, string> = {};
    TIMEZONES.forEach((tz) => {
      let mins = utcMinutes + tz.offset * 60;
      while (mins < 0) mins += 1440;
      mins %= 1440;
      const hh = Math.floor(mins / 60);
      const mm = mins % 60;
      const h12 = hh % 12 || 12;
      result[tz.id] = `${h12}:${String(Math.floor(mm)).padStart(2, "0")} ${hh >= 12 ? "PM" : "AM"}`;
    });
    setState((prev) => ({ ...prev, times: result, stats: { conversions: prev.stats.conversions + 1 } }));
  }, [setState, state.inputTime, state.sourceZone]);
  const getTimeEmoji = (timeStr: string) => { if (!timeStr) return "⏰"; const isPM = timeStr.includes("PM"); const h = parseInt(timeStr); if (!isPM && h < 6) return "🌙"; if (!isPM && h < 12) return "🌅"; if (isPM && h < 6) return "☀️"; return "🌆"; };
  return <div className="bg-card p-8 md:p-10 border-[3px] border-bright-orange glow-orange overflow-hidden" style={{ borderRadius: "1rem 2.5rem 1rem 2.5rem" }}><h2 className="font-display text-3xl md:text-4xl text-gradient-pink-orange mb-2 text-center">🌍 TIME ZONE CONVERTER</h2><p className="text-sm text-muted-foreground text-center mb-4">See what time it is everywhere!</p><div className="flex gap-2 mb-4"><input type="time" className="chrono-input flex-1" value={state.inputTime} onChange={(e) => setState((p) => ({ ...p, inputTime: e.target.value }))} /><select className="chrono-input w-auto text-sm" value={state.sourceZone} onChange={(e) => setState((p) => ({ ...p, sourceZone: Number(e.target.value) }))}>{TIMEZONES.map((tz, i) => <option key={tz.id} value={i}>{tz.label}</option>)}</select></div><div className="grid grid-cols-2 gap-2">{TIMEZONES.map((tz) => { const time = state.times[tz.id] || "--:--"; const isSource = tz === TIMEZONES[state.sourceZone]; return <div key={tz.id} className={`p-2 rounded-lg border transition-all duration-300 ${isSource ? "border-bright-orange bg-bright-orange/20 scale-105" : "border-muted-foreground/20 bg-muted/30 hover:scale-[1.02]"}`}><p className="text-xs text-muted-foreground">{tz.label}</p><p className="font-display text-lg">{getTimeEmoji(time)} {time}</p></div>; })}</div></div>;
}
