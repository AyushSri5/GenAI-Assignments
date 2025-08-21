import FileUpload from "@/components/FileUpload";
import Chat from "@/components/Chat";
import YouTubeUploader from "@/components/Youtube";
import TextAndYouTubeInput from "@/components/TextInput";

export default function Home() {
  return (
    <main className="grid grid-cols-3 gap-1 p-4">
      <div className="flex flex-col gap-4">
        <TextAndYouTubeInput />
        
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
