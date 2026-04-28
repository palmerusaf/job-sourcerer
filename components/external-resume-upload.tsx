import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { textToJsonResume } from "@/utils/textToJsonResume";
import { createResume, addRawResume } from "@/utils/db/resumes";
import { extractKeywords, getTopNKeywords } from "@/utils/ats-matching";
import { db } from "@/utils/db/db";
import { matchingAlgoSettingsTable } from "@/utils/db/schema";

export default function ResumePasteForm() {
  const [text, setText] = useState("");
  const [recordName, setRecordName] = useState(""); // NEW

  const [strategy, setStrategy] = useState<'idf-tf' | 'hardcoded'>('idf-tf');

  async function loadStrategy() {
    const settings = await db.select({ keywordStrategy: matchingAlgoSettingsTable.keywordStrategy }).from(matchingAlgoSettingsTable).limit(1);
    setStrategy(settings[0]?.keywordStrategy ?? 'idf-tf');
  }

  React.useEffect(() => {
    loadStrategy();
  }, []);

  const keywords = useMemo(
    () => getTopNKeywords({ keywordMap: extractKeywords(text, strategy), numKeywords: 25 }),
    [text, strategy]
  );

  async function handleSave() {
    if (text.trim().length < 30) {
      toast.error("Paste at least a few lines of resume text.");
      return;
    }
    try {
      const json = textToJsonResume(text);
      const chosenName = recordName.trim() || json?.basics?.name?.trim() || "Pasted Resume";

      const saved = await createResume({ name: chosenName, json });
      await addRawResume({ name: chosenName, rawText: text, source: "paste", jsonId: saved.id });

      toast.success("Pasted resume saved!");
      setText(""); setRecordName("");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save pasted resume.");
    }
  }

  return (
    <div className="space-y-3 p-4 rounded-2xl border">
      <h2 className="text-xl font-semibold">Paste external resume (plain text)</h2>
      <input
        className="w-full p-2 rounded border"
        placeholder="Resume Name (optional)"
        value={recordName}
        onChange={(e) => setRecordName(e.target.value)}
      />
      <textarea
        className="w-full h-48 p-3 rounded border"
        placeholder="Paste plain text from PDF/Word here…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="text-sm opacity-70">Detected keywords (preview):</div>
      <div className="flex flex-wrap gap-2 text-xs">
        {keywords.map(k => <span key={k} className="px-2 py-1 rounded border">{k}</span>)}
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSave}>Save</Button>
        <Button variant="outline" onClick={() => { setText(""); setRecordName(""); }}>Clear</Button>
      </div>
    </div>
  );
}
