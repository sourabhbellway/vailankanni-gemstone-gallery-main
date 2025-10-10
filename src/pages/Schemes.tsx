import { useState, useEffect } from "react";
import { Calculator, CreditCard, Gift, Shield, TrendingUp, Users, ChevronRight, Star, Calendar, Coins, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { getUserSchemes, type UserScheme } from "@/lib/api/userSchemesController";
import { useToast } from "@/hooks/use-toast";

const Schemes = () => {
  const [selectedPlan, setSelectedPlan] = useState("12");
  const [monthlyAmount, setMonthlyAmount] = useState("5000");
  const [currentGoldRate] = useState(6500); 
  const [calculatedGrams, setCalculatedGrams] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const navigate = useNavigate();

  // Calculate grams based on monthly amount and tenure
  useEffect(() => {
    const amount = parseFloat(monthlyAmount) || 0;
    const months = parseInt(selectedPlan);
    const total = amount * months;
    const grams = total / currentGoldRate;
    setCalculatedGrams(grams);
    setTotalAmount(total);
  }, [monthlyAmount, selectedPlan, currentGoldRate]);

  const { toast } = useToast();
  const [schemes, setSchemes] = useState<UserScheme[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getUserSchemes();
        setSchemes(res.data);
      } catch (err: any) {
        toast({ title: "Failed to load schemes", description: err?.response?.data?.message || "Please try again later" });
      }
    })();
  }, []);

  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "100% Secure",
      description: "Bank-grade security for all transactions"
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Flexible Payments",
      description: "Multiple payment options including auto-debit"
    },
    {
      icon: <Coins className="h-6 w-6" />,
      title: "Live Gold Rates",
      description: "Real-time gold rate updates for accurate calculations"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Expert Support",
      description: "24/7 customer support for all your queries"
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      review: "The EMI scheme helped me buy my dream necklace without any financial stress. Highly recommended!",
      rating: 5,
      scheme: "12 Month Gold Builder"
    },
    {
      name: "Rajesh Kumar",
      review: "Transparent pricing and excellent service. The gold accumulation feature is fantastic.",
      rating: 5,
      scheme: "6 Month Smart Saver"
    },
    {
      name: "Meera Patil",
      review: "Perfect for planned jewelry purchases. The monthly payments are very manageable.",
      rating: 5,
      scheme: "3 Month Quick Saver"
    }
  ];

  return (
    <div className="min-h-screen ">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-luxury py-20 px-4 -mt-20">
        <div className=" mx-auto relative z-10 mt-10">
          <div className="text-center text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in font-serif">
              Gold <span className="text-accent">Savings</span> Schemes
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto animate-fade-in font-serif">
              Start your gold investment journey with our flexible EMI plans and secure your future with precious metals
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm">
              <Badge className="bg-accent text-accent-foreground">Current Gold Rate: ₹{currentGoldRate}/gram</Badge>
              <Badge className="bg-secondary text-secondary-foreground">Live Updates</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Scheme Plans */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4 font-serif">Choose Your Plan</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-serif">
              Select the perfect savings plan that fits your budget and timeline
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {schemes.map((scheme) => (
              <Card key={scheme.id} className={`relative overflow-hidden transition-all duration-300 hover:shadow-luxury hover:scale-105 ${scheme.isPopular === 1 ? 'border-primary shadow-gold' : ''}`}>
                {scheme.isPopular === 1 && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold">
                    POPULAR
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-gradient-gold rounded-full text-white">
                    <Gift className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-2xl font-serif">{scheme.name}</CardTitle>
                  <CardDescription className="text-lg font-semibold text-primary font-serif">
                    {scheme.timeline.replace("months", " Months")}
                  </CardDescription>
                  <div className="text-sm text-muted-foreground">
                    Min. Amount: ₹{scheme.minAmount}/month
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {scheme.points.map((benefit, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <ChevronRight className="h-4 w-4 text-primary" />
                        <span className="text-sm font-serif">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-gradient-gold hover:shadow-gold" onClick={() => navigate(`/payments`)}>
                      Start This Plan
                    </Button>
                    {scheme.attachments?.[0] && (
                      <Button variant="outline" size="icon" asChild>
                        <a
                          href={`${scheme.attachments[0]}`}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Download template"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>



      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4 font-serif">Why Choose Our Schemes?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-serif">
              Experience the benefits of our transparent and secure gold savings plans
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-luxury transition-all duration-300 hover:scale-105">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full text-primary w-fit">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 font-serif">{feature.title}</h3>
                <p className="text-muted-foreground font-serif">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4 font-serif">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-serif">
              Simple steps to start your gold investment journey
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Choose Plan", desc: "Select your preferred EMI duration and monthly amount" },
              { step: "2", title: "Make Payments", desc: "Pay monthly installments via online banking or auto-debit" },
              { step: "3", title: "Accumulate Gold", desc: "Watch your gold grams grow with each payment at live rates" },
              { step: "4", title: "Redeem Jewelry", desc: "Choose from our collection or continue saving beyond tenure" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-gradient-gold text-white rounded-full flex items-center justify-center text-2xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2 font-serif">{item.title}</h3>
                <p className="text-muted-foreground font-serif">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4 font-serif">Customer Success Stories</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-serif">
              Hear from our satisfied customers who have benefited from our schemes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 hover:shadow-luxury transition-all duration-300">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-accent fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic font-serif">"{testimonial.review}"</p>
                <Separator className="my-4" />
                <div>
                  <h4 className="font-semibold font-serif">{testimonial.name}</h4>
                  <p className="text-sm text-primary font-serif">{testimonial.scheme}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 font-serif">Ready to Start Your Gold Journey?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto font-serif">
            Join thousands of satisfied customers who have secured their future with our gold savings schemes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-accent hover:text-accent-foreground">
              <Calendar className="mr-2 h-5 w-5" />
              Book Free Consultation
            </Button>
            <Button size="lg" variant="outline" className="bg-white text-primary hover:bg-accent hover:text-accent-foreground" onClick={() => navigate(`/payments`)}>
              <CreditCard className="mr-2 h-5 w-5" />
              Start EMI Plan
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Schemes;