/**
 * This code was generated by v0 by Vercel.
 * @see https://v0.dev/t/5LWAfwVioH1
 */
import Link from "next/link"
import { CardContent, Card } from "@/components/ui/card"
import { type AiResponse } from "@/types/aiResponse"
import useNotes from "@/lib/context/NotesContext";
import { extractTitle } from "@/lib/note";

export function SearchResults({ aiResponse }: { aiResponse: AiResponse }) {

  const { kv } = useNotes();

  const getNoteTitle = (key: string) => {
    if (key.length === 10 && key.match(/^\d+$/)) {
      if (kv) {
        const value = kv.find(([k, _]) => k === key);
        if (value) {
          return extractTitle(value[1]);
        }
      }
    }
    return "Untitled";
  }

  return (
    <div style={{
      backgroundImage: `linear-gradient(to right, #E5D9F2, #CDC1FF)`
    }} className="w-full max-w-2xl mx-auto px-4 py-6 space-y-6 border mt-4 rounded-xl">
      <div className="text-center">
        <h2 className="text-2xl font-bold">{aiResponse[0]}</h2>
        <p className="text-gray-500">✨ AI Search using <a className="text-sky-500" href="https://embedchain.ai">Embedchain</a></p>
      </div>
      <div className="grid gap-6">
        {aiResponse[1].map((value, index) => (
          <Card key={index}>
            <CardContent className="space-y-2">
              <h3 className="text-lg font-semibold mt-4">{getNoteTitle(value[1].note_id)}</h3>
              <p className="text-gray-500">{value[0]}</p>
              <div className="flex flex-col gap-2">
                <Link className="text-blue-500 hover:underline" href={`/note?id=${value[1].note_id}`}>
                  Note {value[1].note_id}
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}