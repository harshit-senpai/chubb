
import { useEffect, useState } from "react";
import { saveUser } from "@/lib/saveUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import chubbLogo from "./../../src/assets/chubb.png"
import carousel1 from "@/assets/carousel1.jpeg"
import carousel3 from "@/assets/carousel3.jpg"
import carousel2 from "@/assets/carousel2.jpeg"

const chubbCarouselData = [
  {
    img: "/images/chubb-global.jpg",
    text: "54 countries and territories where we operate",
  },
  {
    img: "/images/chubb-engineering.jpg",
    text: "#7 Chubb Engineering Centres supporting our businesses and global functions",
  },
  {
    img: "/images/chubb-family.jpg",
    text: "#1 Personal lines insurer for high-net-worth families in the U.S.",
  },
  {
    img: "/images/chubb-commercial.jpg",
    text: "#1 Commercial lines insurer in the U.S.",
  },
  {
    img: "/images/chubb-homeowners.jpg",
    text: "#1 Insurance provider for Homeowners policy and claims experience satisfaction",
  },
  {
    img: "/images/chubb-products.jpg",
    text: "200+ insurance products and client services",
  },
  {
    img: "/images/chubb-assets.jpg",
    text: "$200B+ in global assets backing our financial strength",
  },
];


const Auth = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [index , setIndex] = useState(0);
  const navigate = useNavigate(); // ✅ ADD THIS

     useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % chubbCarouselData.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await saveUser(name, email);

    if (error) {
      toast.error("Failed to save data");
      return;
    }

    toast.success("User saved successfully!");

    // ✅ DIRECT REDIRECT — WORKS
    localStorage.setItem("user", JSON.stringify({ name, email }));
navigate("/dashboard");

  };



  return (
    <div className="min-h-screen bg-[#00A3E0] flex items-center justify-center p-6 relative overflow-hidden">
  {/* ✅ Watermark Background */}
  <div className="absolute  mt-4 inset-0 flex items-center justify-center">
    <img
      src={chubbLogo}
      alt="Chubb watermark"
      className="w-[70%] max-w-[600px] object-contain opacity-25 mix-blend-overlay"
    />
  </div>

      <div className="relative z-10 grid md:grid-cols-2 gap-10 max-w-6xl w-full items-center">
        {/* ✅ LEFT SIDE — CAROUSEL SECTION */}
        <div className="flex flex-col justify-center px-6 py-5 text-black space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-black drop-shadow-lg animate-fadeInUp">
            Chubb: A Global Leader in Property and Casualty Insurance
          </h2>

          <div className="w-full h-[400px] rounded-3xl overflow-hidden shadow-2xl relative group">
           

            {/* Overlay with text */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-center px-4 transition-all duration-700">
              <p className="text-xl font-semibold text-black drop-shadow-md animate-fadeInUp">
                {chubbCarouselData[index].text}
              </p>
            </div>
          </div>

          {/* Dots Navigation */}
          <div className="flex justify-center gap-2 mt-3">
            {chubbCarouselData.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  i === index ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* ✅ RIGHT SIDE — FORM */}
        <Card className="shadow-2xl border border-white/20 rounded-3xl max-w-md w-full mx-auto bg-white/10 backdrop-blur-md">
          <CardHeader className="text-center space-y-2">
            {/* ✅ CHUBB LOGO */}
            <img src={chubbLogo} alt="Chubb Logo" className="w-32 mx-auto mb-2" />

            <CardTitle className="text-3xl font-bold text-black">Welcome!</CardTitle>

            <CardDescription className="text-base font-medium text-black">
              Enter your details to continue
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5 max-w-sm w-full mx-auto">
              {/* ✅ NAME */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-black">
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="h-12 rounded-xl bg-white/20 text-black placeholder-gray-900 focus:ring-2 focus:ring-black"
                />
              </div>

              {/* ✅ EMAIL */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-black">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="h-12 rounded-xl bg-white/20 text-black placeholder-gray-900 focus:ring-2 focus:ring-black"
                />
              </div>

              {/* ✅ SUBMIT BUTTON */}
              <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold rounded-xl bg-black text-[#00A3E0] hover:bg-gray-900 transition-all duration-300"
              >
                Submit
              </Button>

              {/* ✅ SIGN IN ANONYMOUSLY */}
              <Button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="w-full h-12 text-lg font-semibold rounded-xl bg-gray-800 hover:bg-gray-700 text-[#00A3E0] transition-all duration-300"
              >
                Sign In Anonymously
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
