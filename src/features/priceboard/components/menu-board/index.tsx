import { useState } from "react";
import { MdSettings } from "react-icons/md";
import CongfigHeaderBoardModal from "./ConfigHeaderBoardModal";
import FormSearchStock from "./FormSearchStock";
import MenuBoard from "./MenuBoard";

interface Props {
  active: string;
  onChange: (id: string) => void;
}

export default function MenuDashboard(props: Props) {
  const { active, onChange } = props;

  const [isOpenConfig, setIsOpenConfig] = useState(false);

  return (
    <div className="flex flex-row items-center justify-between">
      <MenuBoard active={active} onChange={onChange} />
      <div className="flex flex-row gap-1 items-center">
        <FormSearchStock />
        <MdSettings
          className="text-lg"
          onClick={() => setIsOpenConfig(true)}
          id="global-tooltip"
          data-tooltip-id="global-tooltip"
          data-tooltip-content="Nhấn đề cài đặt bảng giá!"
          data-tooltip-place="top"
        />

        <CongfigHeaderBoardModal
          isOpen={isOpenConfig}
          onClose={() => setIsOpenConfig(false)}
        />
      </div>
    </div>
  );
}
