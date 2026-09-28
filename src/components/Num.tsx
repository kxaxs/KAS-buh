// Числа с компактным разделителем разрядов.
//
// В моноширинных шрифтах ЛЮБОЙ пробельный символ (включая U+2009 THIN SPACE)
// занимает полную ячейку, поэтому «тонкий пробел» визуально не отличался от
// обычного. Здесь разделитель — пустой inline-элемент фиксированной ширины:
// результат не зависит от шрифта и одинаков на телефоне и в браузере.

import React from "react";
import { formatNumber } from "../lib/app-core";

/** Ширина разделителя относительно текущего размера шрифта. */
export const NUM_SEP_WIDTH = "0.2em";

/** Пустой промежуток между группами цифр. */
export function NumSep() {
  return (
    <span
      aria-hidden="true"
      style={{ display: "inline-block", width: NUM_SEP_WIDTH }}
    />
  );
}

interface NumProps {
  value: number | string | null | undefined;
}

/** Форматирует число и рендерит разделители разрядов span-ами. */
export function Num({ value }: NumProps) {
  const parts = formatNumber(value).split("\u2009");
  return (
    <>
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          {i > 0 && <NumSep />}
          {p}
        </React.Fragment>
      ))}
    </>
  );
}
