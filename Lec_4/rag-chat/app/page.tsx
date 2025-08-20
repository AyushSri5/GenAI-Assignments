import TextInput from "@/components/TextInput";
import FileUpload from "@/components/FileUpload";
import Chat from "@/components/Chat";
import "./globals.css"

export default function Home() {
  return (
    <main className="grid grid-cols-3 gap-4 p-4">
      <div className="flex flex-col gap-4">
        <TextInput />
      </div>
      <div className="flex justify-center items-start">
        <FileUpload />
      </div>
      <div>
        <Chat />
      </div>
    </main>
  );
}
