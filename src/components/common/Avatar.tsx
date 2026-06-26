import { iniciais } from "@/utils/format";

interface AvatarProps {
  nome: string;
  foto?: string;
  tamanho?: "sm" | "md" | "lg" | "xl";
}

export function Avatar({ nome, foto, tamanho = "md" }: AvatarProps) {
  return (
    <span className={`tm-avatar tm-avatar-${tamanho}`}>
      {foto ? <img src={foto} alt={nome} /> : iniciais(nome)}
    </span>
  );
}
