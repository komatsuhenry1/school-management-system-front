import { Construction } from "lucide-react";

export default function Maintenance({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-6 animate-pulse">
        <Construction size={40} />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">{title}</h1>
      <p className="text-gray-500 max-w-md mx-auto">
        Estamos trabalhando para trazer a melhor experiência para você. Esta página estará disponível em breve!
      </p>
      <div className="mt-8 flex gap-3">
        <div className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce" />
        <div className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
        <div className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
      </div>
    </div>
  );
}
