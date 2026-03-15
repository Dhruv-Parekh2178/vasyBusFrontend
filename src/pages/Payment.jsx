import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { toast } from "react-toastify";
import api from "../utils/api";

const stripePromise = loadStripe(
  "pk_test_51T9iv7ECeOEgUqgfXI1b6SlYnFcPyc1ZBaFDUBhFh0BaKbkFbbzLatVrPbXnpA9NrtehFGbLLsJGDmukeCnnPDDm00KSRtpThn"
);

const formatTime = (i) =>
  i ? new Date(i).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : "--";
const formatDate = (d) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "--";

const stripeElementStyle = {
  style: {
    base: {
      fontSize: "14px",
      color: "#1f2937",
      fontFamily: "Inter, sans-serif",
      "::placeholder": { color: "#9ca3af" },
    },
    invalid: { color: "#ef4444" },
  },
};

const CheckoutForm = ({ booking, clientSecret, amountInPaise }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [paying, setPaying] = useState(false);
  const [cardName, setCardName] = useState("");
  const [cardReady, setCardReady] = useState({ number: false, expiry: false, cvc: false });

  const allReady = cardReady.number && cardReady.expiry && cardReady.cvc && cardName.trim();

  const handlePay = async () => {
    if (!stripe || !elements) return;
    if (!cardName.trim()) { toast.error("Please enter cardholder name"); return; }

    setPaying(true);
    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: { name: cardName.trim() },
        },
      });

      if (error) {
        toast.error(error.message || "Payment failed");
        setPaying(false);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        sessionStorage.setItem("paymentIntentId", paymentIntent.id);
        toast.success("Payment successful! Booking confirmed.");
        navigate("/booking-confirmation");
      }
    } catch {
      toast.error("Payment failed. Please try again.");
      setPaying(false);
    }
  };

  const amountInRupees = (amountInPaise / 100).toLocaleString("en-IN");

  return (
    <div className="space-y-4">

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          Cardholder Name
        </label>
        <input
          type="text"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          placeholder="Name on card"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-blue-500 transition"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          Card Number
        </label>
        <div className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus-within:border-blue-500 transition bg-white flex items-center gap-3">
          <i className="ri-bank-card-line text-gray-400 text-lg" />
          <div className="flex-1">
            <CardNumberElement
              options={stripeElementStyle}
              onChange={(e) => setCardReady((p) => ({ ...p, number: e.complete }))}
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Expiry Date
          </label>
          <div className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus-within:border-blue-500 transition bg-white">
            <CardExpiryElement
              options={stripeElementStyle}
              onChange={(e) => setCardReady((p) => ({ ...p, expiry: e.complete }))}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            CVC
          </label>
          <div className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus-within:border-blue-500 transition bg-white flex items-center gap-2">
            <div className="flex-1">
              <CardCvcElement
                options={stripeElementStyle}
                onChange={(e) => setCardReady((p) => ({ ...p, cvc: e.complete }))}
              />
            </div>
            <i className="ri-lock-line text-gray-400" />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-700 flex items-start gap-2">
        <i className="ri-information-line text-sm mt-0.5" />
        <div>
          <span className="font-semibold">Test card:</span> 4242 4242 4242 4242 · Any future date · Any 3-digit CVC
        </div>
      </div>
      <button
        onClick={handlePay}
        disabled={paying || !stripe || !allReady}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed
          text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 text-base"
      >
        {paying ? (
          <><i className="ri-loader-4-line animate-spin" /> Processing Payment...</>
        ) : (
          <><i className="ri-secure-payment-line" /> Pay ₹{amountInRupees}</>
        )}
      </button>

      <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
        <i className="ri-shield-check-line text-green-500" />
        Secured by Stripe · SSL Encrypted
      </p>
    </div>
  );
};

const Payment = () => {
  const navigate = useNavigate();

  const [booking, setBooking]         = useState(null);
  const [schedule, setSchedule]       = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [amountInPaise, setAmountInPaise] = useState(0);
  const [loading, setLoading]         = useState(true);
  const intentCreated = useRef(false);

  useEffect(() => {
    if (intentCreated.current) return;
    intentCreated.current = true;
    const rawBooking  = sessionStorage.getItem("currentBooking");
    const rawSchedule = sessionStorage.getItem("selectedSchedule");

    if (!rawBooking) { navigate("/"); return; }

    const bookingData  = JSON.parse(rawBooking);
    const scheduleData = rawSchedule ? JSON.parse(rawSchedule) : null;

    setBooking(bookingData);
    setSchedule(scheduleData);

    const bookingId = bookingData?.booking?.bookingId;
    if (!bookingId) { toast.error("Invalid booking"); navigate("/"); return; }

    api.post("/payments/create-intent", { booking_id: bookingId })
      .then((res) => {
        const data = res.data?.data;
        setClientSecret(data.clientSecret);
        setAmountInPaise(data.amountInPaise);
      })
      .catch((err) => {
        const status = err.response?.status;
        const msg = err.response?.data?.data?.message || err.response?.data?.message || "Failed to initialize payment";
        console.log("Payment intent error:", status, JSON.stringify(err.response?.data));
        if (status === 409) {
          if (msg.includes("already paid")) {
            toast.info("This booking is already paid.");
            navigate("/booking-confirmation");
          } else {
            toast.error(msg);
            navigate("/");
          }
        } else {
          toast.error(msg);
          navigate("/");
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const b = booking?.booking;
  const passengers = booking?.passengers || [];

  if (loading || !clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="ri-loader-4-line text-4xl text-blue-600 animate-spin block mb-3" />
          <p className="text-gray-500">Initializing secure payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-5 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <i className="ri-secure-payment-line" /> Secure Payment
            </h1>
            <p className="text-blue-200 text-sm mt-0.5">
              {b?.sourceCity} → {b?.destinationCity} · {formatDate(b?.travelDate)}
            </p>
          </div>
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition">
            <i className="ri-arrow-left-line" /> Back
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">

        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
              <i className="ri-bank-card-2-line text-blue-600" /> Payment Details
            </h2>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm
                booking={booking}
                clientSecret={clientSecret}
                amountInPaise={amountInPaise}
              />
            </Elements>
          </div>
        </div>

        <div className="lg:w-80 space-y-4">

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i className="ri-receipt-line text-blue-600" /> Booking Summary
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span className="text-gray-400">Booking ID</span>
                <span className="font-semibold text-gray-800">#{b?.bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Bus</span>
                <span className="font-semibold text-gray-800">{b?.busName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Route</span>
                <span className="font-semibold text-gray-800">{b?.sourceCity} → {b?.destinationCity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Date</span>
                <span className="font-semibold text-gray-800">{formatDate(b?.travelDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Time</span>
                <span className="font-semibold text-gray-800">
                  {formatTime(b?.departureTime)} → {formatTime(b?.arrivalTime)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Passengers</span>
                <span className="font-semibold text-gray-800">{passengers.length}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-800 text-base">
                <span>Total Amount</span>
                <span className="text-blue-600">
                  ₹{Number(b?.totalAmount || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {passengers.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <i className="ri-group-line text-blue-600" /> Passengers
              </h3>
              <div className="space-y-2">
                {passengers.map((p, i) => (
                  <div key={p.bookingSeatId} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-gray-800">{p.passengerName}</p>
                        <p className="text-xs text-gray-400">{p.passengerAge} yrs · {p.passengerGender}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                      {p.seatNumber}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 space-y-2 text-xs text-green-700">
            {[
              { icon: "ri-shield-check-line", text: "256-bit SSL Encryption" },
              { icon: "ri-bank-card-line",    text: "Powered by Stripe" },
              { icon: "ri-refund-2-line",     text: "Secure & PCI Compliant" },
            ].map((b) => (
              <div key={b.text} className="flex items-center gap-2">
                <i className={b.icon + " text-base"} />
                <span>{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;