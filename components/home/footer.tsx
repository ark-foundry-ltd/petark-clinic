export default function Footer() {
  return (
    <footer className="border-t border-slate-100 pry-ff bg-white py-8 text-center text-sm text-slate-500">
      © {new Date().getFullYear()} PetArk. A product of Ark Foundry Ltd.
    </footer>
  );
}