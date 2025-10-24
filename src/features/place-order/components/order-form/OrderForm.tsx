import { useState } from "react";
import ConditionalOrderForm from "./ConditionalOrderForm";
import NormalOrderForm from "./NormalOrderForm";
import ProOrderForm from "./ProOrderForm";

export default function OrderForm() {
  const [typeOrder, setTypeOrder] = useState<"1" | "2" | "3">("1"); // 1: Normal, 2: Conditional, 3: Pro

  const renderForm = () => {
    switch (typeOrder) {
      case "1":
        return <NormalOrderForm />;
      case "2":
        return <ConditionalOrderForm />;
      case "3":
        return <ProOrderForm />;
      default:
        return <NormalOrderForm />;
    }
  };

  return <div className="w-full h-full">{renderForm()}</div>;
}
