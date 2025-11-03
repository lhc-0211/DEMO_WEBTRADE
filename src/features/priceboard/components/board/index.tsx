import { memo, useEffect } from "react";
import { socketClient } from "../../../../services/socket";
import { useAppDispatch } from "../../../../store/hook";
import { setSubscribedOrder } from "../../../../store/slices/stock/slice";
import PriceBoardBase from "./base";

function Board({ id }: { id: string }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!id) return;

    const list =
      id === "vn30"
        ? [
            "ACB:G1:STO",
            "BCM:G1:STO",
            "BID:G1:STO",
            "CTG:G1:STO",
            "DGC:G1:STO",
            "FPT:G1:STO",
            "GAS:G1:STO",
            "GVR:G1:STO",
            "HDB:G1:STO",
            "HPG:G1:STO",
            "LPB:G1:STO",
            "MBB:G1:STO",
            "MSN:G1:STO",
            "MWG:G1:STO",
            "PLX:G1:STO",
            "SAB:G1:STO",
            "SHB:G1:STO",
            "SSB:G1:STO",
            "SSI:G1:STO",
            "STB:G1:STO",
            "TCB:G1:STO",
            "TPB:G1:STO",
            "VCB:G1:STO",
            "VHM:G1:STO",
            "VIB:G1:STO",
            "VIC:G1:STO",
            "VJC:G1:STO",
            "VNM:G1:STO",
            "VPB:G1:STO",
            "VRE:G1:STO",
          ]
        : id === "hnx30"
        ? [
            "BVS:G1:STX",
            "CAP:G1:STX",
            "CEO:G1:STX",
            "DHT:G1:STX",
            "DP3:G1:STX",
            "DTD:G1:STX",
            "DVM:G1:STX",
            "DXP:G1:STX",
            "HGM:G1:STX",
            "HUT:G1:STX",
            "IDC:G1:STX",
            "IDV:G1:STX",
            "L14:G1:STX",
            "L18:G1:STX",
            "LAS:G1:STX",
            "LHC:G1:STX",
            "MBS:G1:STX",
            "NTP:G1:STX",
            "PLC:G1:STX",
            "PSD:G1:STX",
            "PVB:G1:STX",
            "PVC:G1:STX",
            "PVI:G1:STX",
            "PVS:G1:STX",
            "SHS:G1:STX",
            "SLS:G1:STX",
            "TMB:G1:STX",
            "TNG:G1:STX",
            "VC3:G1:STX",
            "VCS:G1:STX",
          ]
        : [];

    dispatch(setSubscribedOrder(list));
    socketClient.subscribe({
      symbols: list,
    });

    return () => {
      socketClient.unsubscribe({
        symbols: list,
      });
    };
  }, [id, dispatch]);

  return <PriceBoardBase />;
}

export default memo(Board);
