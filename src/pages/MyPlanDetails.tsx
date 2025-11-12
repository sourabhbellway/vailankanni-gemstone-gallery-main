import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUserAuth } from "@/context/UserAuthContext";
import { getMyPlans } from "@/lib/api/userSchemesController";
import { Calendar, IndianRupee, Clock, ArrowLeft, CheckCircle2, FileText } from "lucide-react";
import ProfileLayout from "@/components/ProfileLayout";

const MyPlanDetails = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { token } = useUserAuth();
  const [loading, setLoading] = React.useState(true);
  const [plan, setPlan] = React.useState<any>(null);

  React.useEffect(() => {
    if (!token || !planId) return;
    (async () => {
      setLoading(true);
      try {
        const resp = await getMyPlans(token);
        if (resp.success) {
          const found = (resp.data || []).find((p: any) => String(p.id) === String(planId));
          setPlan(found || null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [token, planId]);

  const handleSectionChange = (section: "profile" | "plans" | "wallet" | "vault" | "customOrders") => {
    // Navigate to profile page - the Profile component will handle section state
    navigate("/profile", { state: { activeSection: section } });
  };

  return (
    <ProfileLayout
      activeSection="plans"
      setActiveSection={handleSectionChange}
    >
      {loading ? (
        <div className="p-6">Loading...</div>
      ) : !plan ? (
        <div className="p-6">
          <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
          <div className="text-center text-muted-foreground mt-10">Schemedetails not found.</div>
        </div>
      ) : (
        <div className="border p-6  mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-1">Scheme Details #{plan.id}</h1>
              <div className="text-muted-foreground font-medium">{plan.scheme?.scheme || "—"}</div>
            </div>
            <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
          </div>
          <div className="bg-white rounded shadow-sm border p-4 mb-8">
            <h2 className="text-lg font-semibold mb-4 text-[#084526]">General Info</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-semibold">Status</div>
                <div className="inline-block rounded px-2 py-1 text-xs bg-gray-100 font-semibold">{plan.status}</div>
              </div>
              <div>
                <div className="font-semibold">Timeline</div>
                <div>{plan.scheme?.timeline?.replace("months", " Months")}</div>
              </div>
              <div>
                <div className="font-semibold">Monthly</div>
                <div>₹{Number(plan.monthly_amount).toLocaleString("en-IN")}</div>
              </div>
              <div>
                <div className="font-semibold">Total Paid</div>
                <div>₹{Number(plan.total_paid).toLocaleString("en-IN")}</div>
              </div>
              <div>
                <div className="font-semibold">Started</div>
                <div>{new Date(plan.start_date).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="font-semibold">Ends</div>
                <div>{new Date(plan.end_date).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="font-semibold">Maturity Amount</div>
                <div>₹{plan.scheme?.maturity_amount?.toLocaleString("en-IN")}</div>
              </div>
            </div>
            {plan.scheme?.points?.length ? (
              <div className="mt-4">
                <div className="font-semibold text-sm mb-2">Key Benefits</div>
                <ul className="list-disc pl-6 text-xs space-y-1">
                  {plan.scheme.points.map((point: string, idx: number) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {plan.scheme?.attachments?.length ? (
              <div className="mt-4">
                <div className="font-semibold text-sm mb-2">Attachments</div>
                {plan.scheme.attachments.map((url: string, idx: number) => (
                  <a key={idx} href={url} className="flex items-center gap-2 text-blue-700 underline mb-1 text-xs" target="_blank" rel="noopener noreferrer">
                    <FileText className="w-4 h-4 inline-block" />Download Brochure #{idx + 1}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
          <div className="bg-white rounded shadow-sm border p-4">
            <h2 className="text-lg font-semibold mb-4 text-[#084526]">Installment Payments</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border">
                <thead>
                  <tr>
                    <th className="py-2 px-2">Installment</th>
                    <th className="py-2 px-2">Due Date</th>
                    <th className="py-2 px-2">Status</th>
                    <th className="py-2 px-2">Amount</th>
                    <th className="py-2 px-2">Order ID</th>
                    <th className="py-2 px-2">Payment ID</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.payments?.length ? (
                    plan.payments.map((p: any) => (
                      <tr key={p.id}>
                        <td className="py-2 px-2">#{p.installment_number}</td>
                        <td className="py-2 px-2">{new Date(p.due_date).toLocaleDateString()}</td>
                        <td className="py-2 px-2">
                          {p.status === 'paid' ? (
                            <span className="inline-flex items-center gap-1 text-green-700 font-semibold"><CheckCircle2 className="w-4 h-4 inline-block" /> Paid</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-yellow-700 font-semibold"><Clock className="w-4 h-4 inline-block" /> {p.status}</span>
                          )}
                        </td>
                        <td className="py-2 px-2">₹{Number(p.amount).toLocaleString("en-IN")}</td>
                        <td className="py-2 px-2">{p.razorpay_order_id ?? "—"}</td>
                        <td className="py-2 px-2">{p.razorpay_payment_id ?? "—"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={6} className="text-center text-xs text-muted-foreground py-4">No installments found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </ProfileLayout>
  );
};

export default MyPlanDetails;
