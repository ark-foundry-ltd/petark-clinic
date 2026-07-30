import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-acc-clr/10 to-bg-clr px-4">
      <div className="text-center max-w-3xl mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="rounded-full overflow-hidden bg-white w-20 h-20 flex items-center justify-center shadow-md">
            <Image
              src="/petark_logo.png"
              alt="PetArk logo"
              width={80}
              height={80}
              priority
              className="object-cover"
            />
          </div>
        </div>
        
        <h1 className="text-xl md:text-xl lg:text-3xl font-bold text-sec-clr mb-4 pry-ff">
          Welcome to PetArk for Veterinary Clinics
        </h1>
        <p className="text-md md:text-md lg:text-lg text-gray-500 pry-ff">
          Your pet health monitoring system for animals
        </p>
        
        <div className="mt-8 pry-ff">
          <a 
            href="/login" 
            className="inline-block px-8 py-3 bg-acc-clr text-pry-clr rounded-lg cursor-pointer pry-ff font-semibold hover:bg-acc-clr/80 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Login
          </a>
        </div>
      </div>
    </main>
  );
}