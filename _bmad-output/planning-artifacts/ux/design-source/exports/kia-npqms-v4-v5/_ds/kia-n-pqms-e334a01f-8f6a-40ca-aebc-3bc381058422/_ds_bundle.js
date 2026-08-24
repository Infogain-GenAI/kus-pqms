/* @ds-bundle: {"format":3,"namespace":"KiaNPQMSDesignSystem_e334a0","components":[{"name":"Logo","sourcePath":"components/brand/Logo.jsx"},{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"STATUS","sourcePath":"components/core/statusMap.js"},{"name":"StatusBadge","sourcePath":"components/core/StatusBadge.jsx"},{"name":"StatusIndicator","sourcePath":"components/core/StatusIndicator.jsx"},{"name":"StatusPill","sourcePath":"components/core/StatusPill.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"STATUS_SIZES","sourcePath":"components/core/statusMap.js"},{"name":"EmptyState","sourcePath":"components/feedback/EmptyState.jsx"},{"name":"Spinner","sourcePath":"components/feedback/Spinner.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"SearchField","sourcePath":"components/forms/SearchField.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"Breadcrumb","sourcePath":"components/navigation/Breadcrumb.jsx"},{"name":"Header","sourcePath":"components/navigation/Header.jsx"},{"name":"Pagination","sourcePath":"components/navigation/Pagination.jsx"},{"name":"SideNav","sourcePath":"components/navigation/SideNav.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"},{"name":"ApprovalBar","sourcePath":"components/pqms/ApprovalBar.jsx"},{"name":"CommentCard","sourcePath":"components/pqms/CommentCard.jsx"},{"name":"DataTable","sourcePath":"components/pqms/DataTable.jsx"},{"name":"IssueCard","sourcePath":"components/pqms/IssueCard.jsx"},{"name":"SeverityBar","sourcePath":"components/pqms/SeverityBar.jsx"},{"name":"SEVERITY","sourcePath":"components/pqms/SeverityIndicator.jsx"},{"name":"SeverityIndicator","sourcePath":"components/pqms/SeverityIndicator.jsx"},{"name":"SOURCE","sourcePath":"components/pqms/SourceBadge.jsx"},{"name":"SourceBadge","sourcePath":"components/pqms/SourceBadge.jsx"},{"name":"Timeline","sourcePath":"components/pqms/Timeline.jsx"}],"sourceHashes":{"components/brand/Logo.jsx":"ceb903d725de","components/core/Avatar.jsx":"ed8d36b01b9a","components/core/Badge.jsx":"ae157131a5c0","components/core/Button.jsx":"5f17030cf235","components/core/IconButton.jsx":"aafc96e8e6d6","components/core/StatusBadge.jsx":"7059dc98a21c","components/core/StatusIndicator.jsx":"a8bcd231086f","components/core/StatusPill.jsx":"2b5f2f4aa5d5","components/core/Tag.jsx":"79db078f6609","components/core/statusMap.js":"9a3e8b1d6c30","components/feedback/EmptyState.jsx":"54512bf9e650","components/feedback/Spinner.jsx":"7f7cbc60116e","components/feedback/Toast.jsx":"87baec6d1ce5","components/feedback/Tooltip.jsx":"d25f346ec4e0","components/forms/Checkbox.jsx":"afef0fb481d2","components/forms/Input.jsx":"46adbdeef021","components/forms/Radio.jsx":"374b82fc32a3","components/forms/SearchField.jsx":"027abc2a7ee7","components/forms/Select.jsx":"467817b778ae","components/forms/Switch.jsx":"e872e606a968","components/forms/Textarea.jsx":"e8906d810fe7","components/navigation/Breadcrumb.jsx":"9a732450b241","components/navigation/Header.jsx":"af9deec6fb0a","components/navigation/Pagination.jsx":"07dbbf6ba162","components/navigation/SideNav.jsx":"ce03bcb1c658","components/navigation/Tabs.jsx":"5917200cdac5","components/pqms/ApprovalBar.jsx":"bc9d15535a8c","components/pqms/CommentCard.jsx":"8caf21510e66","components/pqms/DataTable.jsx":"a219f3813026","components/pqms/IssueCard.jsx":"a6adf8831151","components/pqms/SeverityBar.jsx":"385392bb8917","components/pqms/SeverityIndicator.jsx":"a7baf9949f4e","components/pqms/SourceBadge.jsx":"32e66139081f","components/pqms/Timeline.jsx":"54e99ee2639a"},"inlinedExternals":[],"unexposedExports":[{"name":"labelStyle","sourcePath":"components/forms/Input.jsx"}]} */

(() => {

const __ds_ns = (window.KiaNPQMSDesignSystem_e334a0 = window.KiaNPQMSDesignSystem_e334a0 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/brand/Logo.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Kia_PQMS logo. Inline SVG so it recolors via `color` (fill=currentColor)
   and scales crisply. Wordmark viewBox 0 0 159 34; KIA glyph ~7..85. */

const KIA_PATH = "M52.6774 23.975C52.6774 24.1209 52.7173 24.2004 52.8104 24.2004C52.8768 24.2004 52.93 24.1739 52.9965 24.1341L76.988 8.57954C77.4135 8.30107 77.7992 8.15521 78.3711 8.15521H83.6508C84.462 8.15521 85.0073 8.69889 85.0073 9.50778V19.546C85.0073 20.7527 84.7413 21.4555 83.6508 22.1053L77.2539 25.9376C77.1741 25.9906 77.0944 26.0171 77.0412 26.0171C76.9614 26.0171 76.8949 25.9641 76.8949 25.7387V14.0164C76.8949 13.8838 76.855 13.7909 76.7619 13.7909C76.6954 13.7909 76.6422 13.8175 76.5757 13.8572L59.0343 25.2215C58.5422 25.5398 58.1433 25.6326 57.6911 25.6326H46.0545C45.2432 25.6326 44.698 25.0889 44.698 24.28V9.82603C44.698 9.71995 44.6448 9.62713 44.565 9.62713C44.4985 9.62713 44.4453 9.65365 44.3788 9.69343L32.8086 16.6287C32.6889 16.695 32.6623 16.7613 32.6623 16.8143C32.6623 16.8674 32.6756 16.9072 32.7687 16.9867L41.0274 25.2215C41.1338 25.3276 41.2136 25.4204 41.2136 25.5C41.2136 25.5928 41.0939 25.6458 40.9476 25.6458H33.4736C32.8884 25.6458 32.4363 25.553 32.1171 25.2348L27.1034 20.2356C27.0502 20.1825 27.0103 20.156 26.9571 20.156C26.9172 20.156 26.8507 20.1825 26.7975 20.209L18.4191 25.2348C17.9137 25.5398 17.568 25.6326 17.0626 25.6326H9.34918C8.53794 25.6326 7.99268 25.0889 7.99268 24.28V14.4274C7.99268 13.2075 8.25866 12.5179 9.34918 11.8682L15.7859 8.00934C15.8524 7.96956 15.9056 7.9563 15.9588 7.9563C16.0519 7.9563 16.1051 8.06238 16.1051 8.27455V21.4555C16.1051 21.5881 16.145 21.6544 16.2381 21.6544C16.2913 21.6544 16.3578 21.6146 16.4243 21.5749L38.1681 8.53976C38.6868 8.23477 39.006 8.14195 39.6044 8.14195H51.3076C52.1188 8.14195 52.6641 8.68563 52.6641 9.49452L52.6774 23.975Z";
const PQMS_PATH = "M98.64 25.3V10.1H104.74C105.687 10.1 106.54 10.28 107.3 10.64C108.073 10.9867 108.68 11.4933 109.12 12.16C109.56 12.8267 109.78 13.6267 109.78 14.56V14.88C109.78 15.8133 109.56 16.6133 109.12 17.28C108.68 17.9467 108.073 18.46 107.3 18.82C106.54 19.1667 105.687 19.34 104.74 19.34H101.34V25.3H98.64ZM104.34 17.16C105.113 17.16 105.733 16.9533 106.2 16.54C106.68 16.1267 106.92 15.5667 106.92 14.86V14.56C106.92 13.8533 106.68 13.2933 106.2 12.88C105.733 12.4667 105.113 12.26 104.34 12.26H101.34V17.16H104.34ZM126.672 26.4H123.412L122.272 24.94C121.312 25.38 120.219 25.6 118.992 25.6C117.499 25.6 116.192 25.2733 115.072 24.62C113.952 23.9533 113.085 23.04 112.472 21.88C111.872 20.7067 111.572 19.3733 111.572 17.88V17.52C111.572 16.0267 111.872 14.7 112.472 13.54C113.085 12.3667 113.952 11.4533 115.072 10.8C116.192 10.1333 117.499 9.8 118.992 9.8C120.499 9.8 121.812 10.1333 122.932 10.8C124.052 11.4533 124.912 12.3667 125.512 13.54C126.112 14.7 126.412 16.0267 126.412 17.52V17.88C126.412 19.0133 126.232 20.0667 125.872 21.04C125.525 22 125.019 22.82 124.352 23.5L126.672 26.4ZM118.992 23.44C119.619 23.44 120.219 23.3133 120.792 23.06L118.172 19.74H121.312L122.632 21.38C123.205 20.42 123.492 19.2533 123.492 17.88V17.52C123.492 16.4533 123.305 15.5 122.932 14.66C122.572 13.82 122.052 13.16 121.372 12.68C120.705 12.2 119.912 11.96 118.992 11.96C118.085 11.96 117.292 12.2 116.612 12.68C115.932 13.16 115.405 13.82 115.032 14.66C114.672 15.5 114.492 16.4533 114.492 17.52V17.88C114.492 18.96 114.672 19.92 115.032 20.76C115.405 21.6 115.932 22.26 116.612 22.74C117.292 23.2067 118.085 23.44 118.992 23.44ZM131.806 25.3H129.206V10.1H132.806L137.046 20.56L141.366 10.1H144.546V25.3H141.946V14.28L137.426 25.3H136.286L131.806 14.32V25.3ZM147.48 20.82C147.973 21.5667 148.626 22.1867 149.44 22.68C150.266 23.16 151.113 23.4 151.98 23.4C152.82 23.4 153.466 23.2 153.92 22.8C154.386 22.3867 154.62 21.8867 154.62 21.3C154.62 20.8733 154.46 20.4933 154.14 20.16C153.833 19.8267 153.293 19.4533 152.52 19.04L150.3 17.86C149.353 17.3533 148.646 16.8067 148.18 16.22C147.726 15.62 147.5 14.8333 147.5 13.86C147.5 13.1533 147.68 12.4933 148.04 11.88C148.4 11.2533 148.953 10.7533 149.7 10.38C150.446 9.99333 151.36 9.8 152.44 9.8C154.013 9.8 155.473 10.3067 156.82 11.32V14.34C156.193 13.54 155.506 12.9467 154.76 12.56C154.013 12.16 153.24 11.96 152.44 11.96C151.8 11.96 151.293 12.1333 150.92 12.48C150.546 12.8133 150.36 13.22 150.36 13.7C150.36 14.0867 150.48 14.4267 150.72 14.72C150.96 15.0133 151.406 15.3267 152.06 15.66L154.42 16.88C155.46 17.4267 156.226 18.04 156.72 18.72C157.226 19.3867 157.48 20.2267 157.48 21.24C157.48 22.12 157.253 22.8867 156.8 23.54C156.346 24.1933 155.7 24.7 154.86 25.06C154.033 25.42 153.073 25.6 151.98 25.6C151.006 25.6 150.113 25.4267 149.3 25.08C148.486 24.7467 147.88 24.3733 147.48 23.96V20.82Z";
const TONE = {
  // dark = dark ink mark, for light backgrounds
  dark: "var(--kia-midnight, #05141F)",
  // light = white mark, for dark backgrounds
  light: "#FFFFFF"
};
function Logo({
  variant = "default",
  // "default" | "compact" | "icon"
  tone = "dark",
  // "dark" | "light"
  height,
  // px override; sensible defaults per variant
  title = "Kia PQMS",
  style,
  ...rest
}) {
  const color = TONE[tone] || tone;
  const isIcon = variant === "icon";
  const isCompact = variant === "compact";

  // default heights
  const h = height != null ? height : isIcon ? 28 : isCompact ? 20 : 26;

  // icon = KIA glyph only, cropped viewBox
  const viewBox = isIcon ? "6 6 81 22" : "0 0 159 34";
  const ratio = isIcon ? 81 / 22 : 159 / 34;
  const w = Math.round(h * ratio);
  return /*#__PURE__*/React.createElement("svg", _extends({
    role: "img",
    "aria-label": title,
    width: w,
    height: h,
    viewBox: viewBox,
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    style: {
      display: "block",
      color,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("title", null, title), /*#__PURE__*/React.createElement("path", {
    d: KIA_PATH,
    fill: "currentColor"
  }), !isIcon && /*#__PURE__*/React.createElement("path", {
    d: PQMS_PATH,
    fill: "currentColor"
  }));
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Logo.jsx", error: String((e && e.message) || e) }); }

// components/core/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Avatar — user initials or image. Sizes sm | md | lg.
 */
function Avatar({
  name = "",
  src = null,
  size = "md",
  style,
  ...rest
}) {
  const sizes = {
    sm: 24,
    md: 32,
    lg: 40
  };
  const dim = sizes[size] || 32;
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join("");

  // deterministic tint from name
  const hues = ["var(--accent-500)", "var(--status-review)", "var(--status-disposed)", "var(--status-pending)", "var(--kia-midnight-70)"];
  const hue = hues[(name.charCodeAt(0) || 0) % hues.length];
  return /*#__PURE__*/React.createElement("span", _extends({
    title: name,
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: dim,
      height: dim,
      borderRadius: "50%",
      overflow: "hidden",
      background: src ? "var(--neutral-100)" : hue,
      color: "#fff",
      flex: "none",
      font: `var(--fw-semibold) ${dim * 0.4}px/1 var(--font-body)`,
      ...style
    }
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }) : initials);
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Badge — small count / category label.
 * tone: neutral | accent | success | warning | danger | info
 * variant: subtle (tinted) | solid | outline
 */
function Badge({
  tone = "neutral",
  variant = "subtle",
  size = "md",
  children,
  style,
  ...rest
}) {
  const tones = {
    neutral: {
      base: "var(--neutral-500)",
      tint: "var(--neutral-100)",
      text: "var(--neutral-700)"
    },
    accent: {
      base: "var(--accent-500)",
      tint: "var(--accent-50)",
      text: "var(--accent-700)"
    },
    success: {
      base: "var(--success-500)",
      tint: "var(--success-50)",
      text: "var(--success-600)"
    },
    warning: {
      base: "var(--warning-500)",
      tint: "var(--warning-50)",
      text: "var(--warning-600)"
    },
    danger: {
      base: "var(--danger-500)",
      tint: "var(--danger-50)",
      text: "var(--danger-600)"
    },
    info: {
      base: "var(--info-500)",
      tint: "var(--info-50)",
      text: "var(--info-500)"
    }
  };
  const t = tones[tone] || tones.neutral;
  const fs = size === "sm" ? "11px" : "var(--fs-caption)";
  const pad = size === "sm" ? "1px 6px" : "2px 8px";
  const styles = {
    subtle: {
      background: t.tint,
      color: t.text,
      border: "1px solid transparent"
    },
    solid: {
      background: t.base,
      color: "#fff",
      border: "1px solid transparent"
    },
    outline: {
      background: "transparent",
      color: t.text,
      border: `1px solid ${t.base}`
    }
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      font: `var(--fw-semibold) ${fs}/1.4 var(--font-body)`,
      padding: pad,
      borderRadius: "var(--radius-sm)",
      whiteSpace: "nowrap",
      ...styles[variant],
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Button — primary action control.
 * Variants: primary | secondary | tertiary | danger | ghost | link
 * Sizes: sm | md | lg
 */
function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  iconLeft = null,
  iconRight = null,
  fullWidth = false,
  type = "button",
  children,
  style,
  ...rest
}) {
  const sizes = {
    sm: {
      h: "var(--control-sm)",
      px: "10px",
      fs: "var(--fs-body-sm)",
      gap: "6px"
    },
    md: {
      h: "var(--control-md)",
      px: "14px",
      fs: "var(--fs-body-md)",
      gap: "8px"
    },
    lg: {
      h: "var(--control-lg)",
      px: "18px",
      fs: "var(--fs-body-lg)",
      gap: "8px"
    }
  };
  const s = sizes[size] || sizes.md;
  const palette = {
    primary: {
      bg: "var(--kia-midnight)",
      fg: "var(--text-inverse)",
      bd: "transparent",
      hbg: "var(--kia-midnight-80)",
      abg: "var(--kia-midnight-90)"
    },
    secondary: {
      bg: "var(--surface-card)",
      fg: "var(--text-primary)",
      bd: "var(--border-default)",
      hbg: "var(--neutral-50)",
      abg: "var(--neutral-100)"
    },
    tertiary: {
      bg: "var(--accent-50)",
      fg: "var(--accent-700)",
      bd: "transparent",
      hbg: "var(--accent-100)",
      abg: "var(--accent-100)"
    },
    danger: {
      bg: "var(--danger-500)",
      fg: "#fff",
      bd: "transparent",
      hbg: "var(--danger-600)",
      abg: "var(--danger-600)"
    },
    ghost: {
      bg: "transparent",
      fg: "var(--text-secondary)",
      bd: "transparent",
      hbg: "var(--neutral-50)",
      abg: "var(--neutral-100)"
    },
    link: {
      bg: "transparent",
      fg: "var(--text-link)",
      bd: "transparent",
      hbg: "transparent",
      abg: "transparent"
    }
  };
  const isLink = variant === "link";
  const p = palette[variant] || palette.primary;
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const isDisabled = disabled || loading;
  const bg = isDisabled ? "var(--disabled-bg)" : active ? p.abg : hover ? p.hbg : p.bg;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: isDisabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setActive(false);
    },
    onMouseDown: () => setActive(true),
    onMouseUp: () => setActive(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: s.gap,
      height: s.h,
      padding: isLink ? "0 4px" : `0 ${s.px}`,
      width: fullWidth ? "100%" : "auto",
      font: `var(--fw-semibold) ${s.fs}/1 var(--font-body)`,
      color: isDisabled ? "var(--text-disabled)" : p.fg,
      background: bg,
      border: `1px solid ${isDisabled ? isLink ? "transparent" : "var(--border-subtle)" : p.bd}`,
      borderRadius: "var(--radius-md)",
      cursor: isDisabled ? "not-allowed" : "pointer",
      textDecoration: isLink && hover && !isDisabled ? "underline" : "none",
      textUnderlineOffset: "3px",
      transition: "background var(--dur-fast) var(--ease-standard)",
      whiteSpace: "nowrap",
      ...style
    }
  }, rest), loading && /*#__PURE__*/React.createElement(Spinner, null), !loading && iconLeft, children, !loading && iconRight);
}
function Spinner() {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      width: 14,
      height: 14,
      borderRadius: "50%",
      border: "2px solid currentColor",
      borderTopColor: "transparent",
      display: "inline-block",
      animation: "kia-spin 0.7s linear infinite"
    }
  });
}
if (typeof document !== "undefined" && !document.getElementById("kia-spin-kf")) {
  const st = document.createElement("style");
  st.id = "kia-spin-kf";
  st.textContent = "@keyframes kia-spin{to{transform:rotate(360deg)}}";
  document.head.appendChild(st);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * IconButton — square, icon-only action. Pass a Lucide icon as children.
 * Variants: default | ghost | danger; Sizes: sm | md | lg
 */
function IconButton({
  variant = "ghost",
  size = "md",
  disabled = false,
  "aria-label": ariaLabel,
  children,
  style,
  ...rest
}) {
  const sizes = {
    sm: 28,
    md: 36,
    lg: 44
  };
  const dim = sizes[size] || 36;
  const palette = {
    default: {
      bg: "var(--surface-card)",
      bd: "var(--border-default)",
      fg: "var(--text-secondary)",
      hbg: "var(--neutral-50)"
    },
    ghost: {
      bg: "transparent",
      bd: "transparent",
      fg: "var(--text-secondary)",
      hbg: "var(--neutral-50)"
    },
    danger: {
      bg: "transparent",
      bd: "transparent",
      fg: "var(--danger-500)",
      hbg: "var(--danger-50)"
    }
  };
  const p = palette[variant] || palette.ghost;
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", _extends({
    "aria-label": ariaLabel,
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: dim,
      height: dim,
      color: disabled ? "var(--text-disabled)" : p.fg,
      background: disabled ? "var(--disabled-bg)" : hover ? p.hbg : p.bg,
      border: `1px solid ${disabled ? "var(--border-subtle)" : p.bd}`,
      borderRadius: "var(--radius-md)",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "background var(--dur-fast) var(--ease-standard)",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Tag — removable / selectable chip (filters, multi-select values).
 */
function Tag({
  children,
  onRemove,
  selected = false,
  disabled = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      height: 24,
      padding: "0 4px 0 10px",
      font: `var(--fw-medium) var(--fs-body-sm)/1 var(--font-body)`,
      color: disabled ? "var(--text-disabled)" : selected ? "var(--accent-700)" : "var(--text-secondary)",
      background: selected ? "var(--accent-50)" : "var(--neutral-50)",
      border: `1px solid ${selected ? "var(--accent-300)" : "var(--border-subtle)"}`,
      borderRadius: "var(--radius-pill)",
      ...(!onRemove && {
        paddingRight: 10
      }),
      ...style
    }
  }, rest), children, onRemove && /*#__PURE__*/React.createElement("button", {
    "aria-label": "Remove",
    onClick: onRemove,
    disabled: disabled,
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 16,
      height: 16,
      padding: 0,
      border: "none",
      borderRadius: "50%",
      background: "transparent",
      color: "inherit",
      cursor: "pointer",
      lineHeight: 0
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18M6 6l12 12"
  }))));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/core/statusMap.js
try { (() => {
/* Shared canonical N-PQMS status definitions + size scale.
   Consumed by StatusBadge, StatusPill, and StatusIndicator. */

const STATUS = {
  draft: {
    label: "Draft",
    color: "var(--status-draft)",
    tint: "var(--neutral-100)",
    text: "var(--neutral-700)"
  },
  open: {
    label: "Open",
    color: "var(--status-open)",
    tint: "var(--accent-50)",
    text: "var(--accent-700)"
  },
  review: {
    label: "In Review",
    color: "var(--status-review)",
    tint: "#F0EBFB",
    text: "#5639B5"
  },
  pending: {
    label: "Pending Approval",
    color: "var(--status-pending)",
    tint: "var(--warning-50)",
    text: "var(--warning-600)"
  },
  disposed: {
    label: "Disposed",
    color: "var(--status-disposed)",
    tint: "#E2F4F2",
    text: "#0A6F64"
  },
  closed: {
    label: "Closed",
    color: "var(--status-closed)",
    tint: "var(--neutral-100)",
    text: "var(--neutral-700)"
  },
  monitoring: {
    label: "Monitoring",
    color: "var(--status-monitor)",
    tint: "#FBF3D6",
    text: "#8A6D08"
  },
  escalated: {
    label: "Escalated",
    color: "var(--status-escalated)",
    tint: "var(--danger-50)",
    text: "var(--danger-600)"
  }
};
const STATUS_SIZES = {
  sm: {
    h: 18,
    px: 7,
    fs: "11px",
    dot: 6
  },
  md: {
    h: 22,
    px: 9,
    fs: "var(--fs-caption)",
    dot: 7
  },
  lg: {
    h: 28,
    px: 12,
    fs: "var(--fs-body-sm)",
    dot: 8
  }
};
Object.assign(__ds_scope, { STATUS, STATUS_SIZES });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/statusMap.js", error: String((e && e.message) || e) }); }

// components/core/StatusBadge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * StatusBadge — workflow status as a tinted badge (soft background + status dot).
 * The default, most compact status treatment; use in tables and dense lists.
 * status: draft|open|review|pending|disposed|closed|monitoring|escalated
 */
function StatusBadge({
  status = "draft",
  size = "md",
  disabled = false,
  style,
  ...rest
}) {
  const s = __ds_scope.STATUS[status] || __ds_scope.STATUS.draft;
  const z = __ds_scope.STATUS_SIZES[size] || __ds_scope.STATUS_SIZES.md;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      height: z.h,
      padding: `0 ${z.px}px`,
      borderRadius: "var(--radius-sm)",
      font: `var(--fw-semibold) ${z.fs}/1 var(--font-body)`,
      background: s.tint,
      color: s.text,
      opacity: disabled ? 0.5 : 1,
      whiteSpace: "nowrap",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      width: z.dot,
      height: z.dot,
      borderRadius: "50%",
      background: s.color,
      flex: "none"
    }
  }), s.label);
}
Object.assign(__ds_scope, { STATUS: __ds_scope.STATUS, StatusBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StatusBadge.jsx", error: String((e && e.message) || e) }); }

// components/core/StatusIndicator.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * StatusIndicator — workflow status as a minimal colored dot + label.
 * The lightest treatment; use inline in text, metadata rows, and legends.
 * status: draft|open|review|pending|disposed|closed|monitoring|escalated
 */
function StatusIndicator({
  status = "draft",
  size = "md",
  disabled = false,
  style,
  ...rest
}) {
  const s = __ds_scope.STATUS[status] || __ds_scope.STATUS.draft;
  const z = __ds_scope.STATUS_SIZES[size] || __ds_scope.STATUS_SIZES.md;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      opacity: disabled ? 0.5 : 1,
      whiteSpace: "nowrap",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      width: z.dot,
      height: z.dot,
      borderRadius: "50%",
      background: s.color,
      flex: "none"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: `var(--fw-medium) ${z.fs}/1 var(--font-body)`,
      color: "var(--text-primary)"
    }
  }, s.label));
}
Object.assign(__ds_scope, { StatusIndicator });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StatusIndicator.jsx", error: String((e && e.message) || e) }); }

// components/core/StatusPill.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * StatusPill — workflow status as a solid, high-emphasis pill.
 * Use for the single most important status on a screen (e.g. an issue header).
 * status: draft|open|review|pending|disposed|closed|monitoring|escalated
 */
function StatusPill({
  status = "draft",
  size = "md",
  disabled = false,
  style,
  ...rest
}) {
  const s = __ds_scope.STATUS[status] || __ds_scope.STATUS.draft;
  const z = __ds_scope.STATUS_SIZES[size] || __ds_scope.STATUS_SIZES.md;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      height: z.h,
      padding: `0 ${z.px + 3}px`,
      borderRadius: "var(--radius-pill)",
      font: `var(--fw-semibold) ${z.fs}/1 var(--font-body)`,
      background: s.color,
      color: "#fff",
      opacity: disabled ? 0.5 : 1,
      whiteSpace: "nowrap",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      width: z.dot,
      height: z.dot,
      borderRadius: "50%",
      background: "rgba(255,255,255,0.9)",
      flex: "none"
    }
  }), s.label);
}
Object.assign(__ds_scope, { StatusPill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StatusPill.jsx", error: String((e && e.message) || e) }); }

// components/feedback/EmptyState.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** EmptyState — no-data / no-results placeholder with optional action. */
function EmptyState({
  icon,
  title,
  message,
  action,
  compact = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      gap: 6,
      padding: compact ? "28px 24px" : "56px 24px",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      width: compact ? 40 : 52,
      height: compact ? 40 : 52,
      borderRadius: "50%",
      background: "var(--neutral-100)",
      color: "var(--neutral-500)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: compact ? 20 : 24,
    height: compact ? 20 : 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.75",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, icon || /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m21 21-4.3-4.3"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      font: `var(--fw-semibold) var(--fs-body-lg)/1.3 var(--font-body)`,
      color: "var(--text-primary)"
    }
  }, title), message && /*#__PURE__*/React.createElement("div", {
    style: {
      font: `var(--fw-regular) var(--fs-body-md)/1.5 var(--font-body)`,
      color: "var(--text-muted)",
      maxWidth: 360,
      textWrap: "pretty"
    }
  }, message), action && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, action));
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Spinner.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Spinner — indeterminate loading indicator. */
function Spinner({
  size = 20,
  thickness = 2.5,
  color = "var(--accent-500)",
  label,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    role: "status",
    "aria-label": label || "Loading",
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      width: size,
      height: size,
      borderRadius: "50%",
      display: "inline-block",
      border: `${thickness}px solid var(--neutral-200)`,
      borderTopColor: color,
      animation: "kia-spin 0.7s linear infinite"
    }
  }), label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: `var(--fw-medium) var(--fs-body-sm)/1 var(--font-body)`,
      color: "var(--text-muted)"
    }
  }, label));
}
if (typeof document !== "undefined" && !document.getElementById("kia-spin-kf")) {
  const st = document.createElement("style");
  st.id = "kia-spin-kf";
  st.textContent = "@keyframes kia-spin{to{transform:rotate(360deg)}}";
  document.head.appendChild(st);
}
Object.assign(__ds_scope, { Spinner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Spinner.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Toast — transient notification. tone: info|success|warning|danger */
function Toast({
  tone = "info",
  title,
  message,
  onClose,
  style,
  ...rest
}) {
  const map = {
    info: {
      color: "var(--info-500)",
      icon: /*#__PURE__*/React.createElement("path", {
        d: "M12 16v-4M12 8h.01"
      })
    },
    success: {
      color: "var(--success-500)",
      icon: /*#__PURE__*/React.createElement("path", {
        d: "M20 6 9 17l-5-5"
      })
    },
    warning: {
      color: "var(--warning-500)",
      icon: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
        d: "M12 9v4M12 17h.01"
      }), /*#__PURE__*/React.createElement("path", {
        d: "m21.7 18-9-15.6a1 1 0 0 0-1.7 0l-9 15.6a1 1 0 0 0 .9 1.5h18a1 1 0 0 0 .9-1.5Z"
      }))
    },
    danger: {
      color: "var(--danger-500)",
      icon: /*#__PURE__*/React.createElement("path", {
        d: "M18 6 6 18M6 6l12 12"
      })
    }
  }[tone];
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "status",
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      width: 360,
      maxWidth: "90vw",
      padding: "12px 14px",
      background: "var(--surface-card)",
      border: "1px solid var(--border-subtle)",
      borderLeft: `3px solid ${map.color}`,
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-lg)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      color: map.color,
      display: "inline-flex",
      flex: "none",
      marginTop: 1
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, tone === "info" || tone === "success" || tone === "danger" ? /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  }) : null, map.icon)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      font: `var(--fw-semibold) var(--fs-body-md)/1.35 var(--font-body)`,
      color: "var(--text-primary)"
    }
  }, title), message && /*#__PURE__*/React.createElement("div", {
    style: {
      font: `var(--fw-regular) var(--fs-body-sm)/1.45 var(--font-body)`,
      color: "var(--text-secondary)",
      marginTop: 2,
      textWrap: "pretty"
    }
  }, message)), onClose && /*#__PURE__*/React.createElement("button", {
    "aria-label": "Dismiss",
    onClick: onClose,
    style: {
      border: "none",
      background: "transparent",
      color: "var(--text-muted)",
      cursor: "pointer",
      padding: 2,
      flex: "none"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "15",
    height: "15",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18M6 6l12 12"
  }))));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Tooltip — hover/focus label. placement: top|bottom|left|right */
function Tooltip({
  label,
  placement = "top",
  children,
  style,
  ...rest
}) {
  const [open, setOpen] = React.useState(false);
  const pos = {
    top: {
      bottom: "calc(100% + 6px)",
      left: "50%",
      transform: "translateX(-50%)"
    },
    bottom: {
      top: "calc(100% + 6px)",
      left: "50%",
      transform: "translateX(-50%)"
    },
    left: {
      right: "calc(100% + 6px)",
      top: "50%",
      transform: "translateY(-50%)"
    },
    right: {
      left: "calc(100% + 6px)",
      top: "50%",
      transform: "translateY(-50%)"
    }
  }[placement];
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      position: "relative",
      display: "inline-flex"
    },
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
    onFocus: () => setOpen(true),
    onBlur: () => setOpen(false)
  }, rest), children, open && /*#__PURE__*/React.createElement("span", {
    role: "tooltip",
    style: {
      position: "absolute",
      zIndex: "var(--z-dropdown)",
      ...pos,
      padding: "5px 9px",
      borderRadius: "var(--radius-sm)",
      background: "var(--kia-midnight)",
      color: "#fff",
      font: `var(--fw-medium) var(--fs-caption)/1.3 var(--font-body)`,
      whiteSpace: "nowrap",
      boxShadow: "var(--shadow-md)",
      pointerEvents: "none",
      ...style
    }
  }, label));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Checkbox — supports checked, indeterminate, disabled. */
function Checkbox({
  label,
  checked = false,
  indeterminate = false,
  disabled = false,
  onChange,
  id,
  style,
  ...rest
}) {
  const rid = id || React.useId();
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  const on = checked || indeterminate;
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: rid,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      cursor: disabled ? "not-allowed" : "pointer",
      color: disabled ? "var(--text-disabled)" : "var(--text-primary)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      display: "inline-flex",
      flex: "none"
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    ref: ref,
    id: rid,
    type: "checkbox",
    checked: checked,
    disabled: disabled,
    onChange: onChange,
    style: {
      position: "absolute",
      opacity: 0,
      width: 18,
      height: 18,
      margin: 0,
      cursor: "inherit"
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      width: 18,
      height: 18,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "var(--radius-sm)",
      background: disabled ? "var(--disabled-bg)" : on ? "var(--kia-midnight)" : "var(--surface-card)",
      border: `1.5px solid ${disabled ? "var(--border-default)" : on ? "var(--kia-midnight)" : "var(--border-strong)"}`,
      color: "#fff",
      transition: "all var(--dur-fast)"
    }
  }, indeterminate ? /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "3.5",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14"
  })) : checked ? /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "3.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6 9 17l-5-5"
  })) : null)), label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: `var(--fw-regular) var(--fs-body-md)/1.3 var(--font-body)`
    }
  }, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Input — text field with label, helper, and validation states.
 * state: default | error | success | disabled (via disabled prop)
 */
function Input({
  label,
  helper,
  error,
  success,
  required = false,
  size = "md",
  iconLeft = null,
  disabled = false,
  id,
  style,
  ...rest
}) {
  const rid = id || React.useId();
  const h = size === "sm" ? "var(--control-sm)" : size === "lg" ? "var(--control-lg)" : "var(--control-md)";
  const [focus, setFocus] = React.useState(false);
  const invalid = !!error;
  const valid = !invalid && !!success;
  const borderColor = invalid ? "var(--danger-500)" : valid ? "var(--success-500)" : focus ? "var(--accent-500)" : "var(--border-default)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: rid,
    style: labelStyle
  }, label, required && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--danger-500)",
      marginLeft: 2
    }
  }, "*")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center"
    }
  }, iconLeft && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 10,
      display: "inline-flex",
      color: "var(--text-muted)",
      pointerEvents: "none"
    }
  }, iconLeft), /*#__PURE__*/React.createElement("input", _extends({
    id: rid,
    disabled: disabled,
    "aria-invalid": invalid,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      width: "100%",
      height: h,
      boxSizing: "border-box",
      padding: iconLeft ? valid ? "0 34px 0 34px" : "0 12px 0 34px" : valid ? "0 34px 0 12px" : "0 12px",
      font: `var(--fw-regular) var(--fs-body-md)/1 var(--font-body)`,
      color: "var(--text-primary)",
      background: disabled ? "var(--disabled-bg)" : "var(--surface-card)",
      border: `1px solid ${borderColor}`,
      borderRadius: "var(--radius-md)",
      outline: "none",
      boxShadow: focus && !invalid && !valid ? "var(--shadow-focus)" : "none",
      cursor: disabled ? "not-allowed" : "text",
      transition: "border-color var(--dur-fast), box-shadow var(--dur-fast)"
    }
  }, rest)), valid && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      right: 10,
      display: "inline-flex",
      color: "var(--success-500)",
      pointerEvents: "none"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6 9 17l-5-5"
  })))), (error || success || helper) && /*#__PURE__*/React.createElement("span", {
    style: {
      font: `var(--fw-regular) var(--fs-caption)/1.4 var(--font-body)`,
      color: invalid ? "var(--danger-500)" : valid ? "var(--success-600)" : "var(--text-muted)"
    }
  }, error || success || helper));
}
const labelStyle = {
  font: `var(--fw-semibold) var(--fs-caption)/1.3 var(--font-body)`,
  letterSpacing: "0.02em",
  color: "var(--text-secondary)"
};
Object.assign(__ds_scope, { Input, labelStyle });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Radio — single selection within a group (share a `name`). */
function Radio({
  label,
  checked = false,
  disabled = false,
  onChange,
  name,
  value,
  id,
  style,
  ...rest
}) {
  const rid = id || React.useId();
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: rid,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      cursor: disabled ? "not-allowed" : "pointer",
      color: disabled ? "var(--text-disabled)" : "var(--text-primary)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      display: "inline-flex",
      flex: "none"
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: rid,
    type: "radio",
    name: name,
    value: value,
    checked: checked,
    disabled: disabled,
    onChange: onChange,
    style: {
      position: "absolute",
      opacity: 0,
      width: 18,
      height: 18,
      margin: 0,
      cursor: "inherit"
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      width: 18,
      height: 18,
      borderRadius: "50%",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      background: disabled ? "var(--disabled-bg)" : "var(--surface-card)",
      border: `1.5px solid ${disabled ? "var(--border-default)" : checked ? "var(--kia-midnight)" : "var(--border-strong)"}`,
      transition: "all var(--dur-fast)"
    }
  }, checked && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: disabled ? "var(--text-disabled)" : "var(--kia-midnight)"
    }
  }))), label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: `var(--fw-regular) var(--fs-body-md)/1.3 var(--font-body)`
    }
  }, label));
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/SearchField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** SearchField — search input with leading icon and optional clear. */
function SearchField({
  value,
  onChange,
  onClear,
  placeholder = "Search…",
  size = "md",
  disabled = false,
  style,
  ...rest
}) {
  const h = size === "sm" ? "var(--control-sm)" : size === "lg" ? "var(--control-lg)" : "var(--control-md)";
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      height: h,
      background: disabled ? "var(--disabled-bg)" : "var(--surface-card)",
      border: `1px solid ${focus ? "var(--accent-500)" : "var(--border-default)"}`,
      borderRadius: "var(--radius-md)",
      boxShadow: focus ? "var(--shadow-focus)" : "none",
      transition: "border-color var(--dur-fast), box-shadow var(--dur-fast)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 10,
      display: "inline-flex",
      color: "var(--text-muted)"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m21 21-4.3-4.3"
  }))), /*#__PURE__*/React.createElement("input", _extends({
    type: "search",
    value: value,
    onChange: onChange,
    disabled: disabled,
    placeholder: placeholder,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      width: "100%",
      height: "100%",
      boxSizing: "border-box",
      padding: "0 32px 0 32px",
      border: "none",
      outline: "none",
      background: "transparent",
      font: `var(--fw-regular) var(--fs-body-md)/1 var(--font-body)`,
      color: "var(--text-primary)"
    }
  }, rest)), value && onClear && /*#__PURE__*/React.createElement("button", {
    "aria-label": "Clear search",
    onClick: onClear,
    style: {
      position: "absolute",
      right: 8,
      display: "inline-flex",
      border: "none",
      background: "transparent",
      color: "var(--text-muted)",
      cursor: "pointer",
      padding: 2
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.5",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18M6 6l12 12"
  }))));
}
Object.assign(__ds_scope, { SearchField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SearchField.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Select — native dropdown styled to the system, with label / helper / error. */
function Select({
  label,
  helper,
  error,
  required = false,
  size = "md",
  options = [],
  placeholder,
  disabled = false,
  id,
  style,
  children,
  ...rest
}) {
  const rid = id || React.useId();
  const h = size === "sm" ? "var(--control-sm)" : size === "lg" ? "var(--control-lg)" : "var(--control-md)";
  const [focus, setFocus] = React.useState(false);
  const invalid = !!error;
  const borderColor = invalid ? "var(--danger-500)" : focus ? "var(--accent-500)" : "var(--border-default)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: rid,
    style: __ds_scope.labelStyle
  }, label, required && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--danger-500)",
      marginLeft: 2
    }
  }, "*")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: rid,
    disabled: disabled,
    "aria-invalid": invalid,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      width: "100%",
      height: h,
      boxSizing: "border-box",
      appearance: "none",
      padding: "0 34px 0 12px",
      font: `var(--fw-regular) var(--fs-body-md)/1 var(--font-body)`,
      color: "var(--text-primary)",
      background: disabled ? "var(--disabled-bg)" : "var(--surface-card)",
      border: `1px solid ${borderColor}`,
      borderRadius: "var(--radius-md)",
      outline: "none",
      boxShadow: focus && !invalid ? "var(--shadow-focus)" : "none",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "border-color var(--dur-fast), box-shadow var(--dur-fast)"
    }
  }, rest), placeholder && /*#__PURE__*/React.createElement("option", {
    value: ""
  }, placeholder), options.map(o => {
    const val = typeof o === "string" ? o : o.value;
    const lbl = typeof o === "string" ? o : o.label;
    return /*#__PURE__*/React.createElement("option", {
      key: val,
      value: val
    }, lbl);
  }), children), /*#__PURE__*/React.createElement("svg", {
    style: {
      position: "absolute",
      right: 12,
      pointerEvents: "none",
      color: "var(--text-muted)"
    },
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "m6 9 6 6 6-6"
  }))), (error || helper) && /*#__PURE__*/React.createElement("span", {
    style: {
      font: `var(--fw-regular) var(--fs-caption)/1.4 var(--font-body)`,
      color: invalid ? "var(--danger-500)" : "var(--text-muted)"
    }
  }, error || helper));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Switch — on/off toggle for immediate settings. */
function Switch({
  label,
  checked = false,
  disabled = false,
  onChange,
  size = "md",
  id,
  style,
  ...rest
}) {
  const rid = id || React.useId();
  const dims = size === "sm" ? {
    w: 32,
    h: 18,
    k: 14
  } : {
    w: 40,
    h: 22,
    k: 18
  };
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: rid,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      cursor: disabled ? "not-allowed" : "pointer",
      color: disabled ? "var(--text-disabled)" : "var(--text-primary)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      display: "inline-flex",
      flex: "none"
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: rid,
    type: "checkbox",
    role: "switch",
    checked: checked,
    disabled: disabled,
    onChange: onChange,
    style: {
      position: "absolute",
      opacity: 0,
      width: dims.w,
      height: dims.h,
      margin: 0,
      cursor: "inherit"
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      width: dims.w,
      height: dims.h,
      borderRadius: "var(--radius-pill)",
      background: disabled ? "var(--neutral-200)" : checked ? "var(--kia-midnight)" : "var(--neutral-300)",
      transition: "background var(--dur-base) var(--ease-standard)",
      display: "inline-block"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 2,
      left: 2,
      width: dims.k,
      height: dims.k,
      borderRadius: "50%",
      background: "#fff",
      boxShadow: "var(--shadow-xs)",
      transform: checked ? `translateX(${dims.w - dims.k - 4}px)` : "translateX(0)",
      transition: "transform var(--dur-base) var(--ease-standard)"
    }
  }))), label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: `var(--fw-regular) var(--fs-body-md)/1.3 var(--font-body)`
    }
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Textarea — multi-line field with label / helper / error. */
function Textarea({
  label,
  helper,
  error,
  required = false,
  rows = 4,
  disabled = false,
  id,
  style,
  ...rest
}) {
  const rid = id || React.useId();
  const [focus, setFocus] = React.useState(false);
  const invalid = !!error;
  const borderColor = invalid ? "var(--danger-500)" : focus ? "var(--accent-500)" : "var(--border-default)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: rid,
    style: __ds_scope.labelStyle
  }, label, required && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--danger-500)",
      marginLeft: 2
    }
  }, "*")), /*#__PURE__*/React.createElement("textarea", _extends({
    id: rid,
    rows: rows,
    disabled: disabled,
    "aria-invalid": invalid,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      width: "100%",
      boxSizing: "border-box",
      padding: "10px 12px",
      resize: "vertical",
      font: `var(--fw-regular) var(--fs-body-md)/1.5 var(--font-body)`,
      color: "var(--text-primary)",
      background: disabled ? "var(--disabled-bg)" : "var(--surface-card)",
      border: `1px solid ${borderColor}`,
      borderRadius: "var(--radius-md)",
      outline: "none",
      boxShadow: focus && !invalid ? "var(--shadow-focus)" : "none",
      transition: "border-color var(--dur-fast), box-shadow var(--dur-fast)"
    }
  }, rest)), (error || helper) && /*#__PURE__*/React.createElement("span", {
    style: {
      font: `var(--fw-regular) var(--fs-caption)/1.4 var(--font-body)`,
      color: invalid ? "var(--danger-500)" : "var(--text-muted)"
    }
  }, error || helper));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Breadcrumb.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Breadcrumb — path trail. items: [{ label, href? }] */
function Breadcrumb({
  items = [],
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("nav", _extends({
    "aria-label": "Breadcrumb",
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      ...style
    }
  }, rest), items.map((it, i) => {
    const last = i === items.length - 1;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: i
    }, last ? /*#__PURE__*/React.createElement("span", {
      "aria-current": "page",
      style: {
        font: `var(--fw-semibold) var(--fs-body-sm)/1 var(--font-body)`,
        color: "var(--text-primary)"
      }
    }, it.label) : /*#__PURE__*/React.createElement("a", {
      href: it.href || "#",
      style: {
        font: `var(--fw-regular) var(--fs-body-sm)/1 var(--font-body)`,
        color: "var(--text-muted)",
        textDecoration: "none"
      }
    }, it.label), !last && /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "var(--neutral-400)",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "m9 18 6-6-6-6"
    })));
  }));
}
Object.assign(__ds_scope, { Breadcrumb });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Breadcrumb.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Header.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Header — top app bar (60px). Left: title / breadcrumb slot. Right: actions slot.
 */
function Header({
  title,
  left,
  right,
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("header", _extends({
    style: {
      height: "var(--header-height)",
      flex: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      padding: "0 24px",
      background: "var(--surface-card)",
      borderBottom: "1px solid var(--border-subtle)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      minWidth: 0
    }
  }, left, title && /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: `var(--fw-semibold) var(--fs-h3)/1.2 var(--font-body)`,
      color: "var(--text-primary)",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, title), children), right && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      flex: "none"
    }
  }, right));
}
Object.assign(__ds_scope, { Header });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Header.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Pagination.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Pagination — page controls + range summary. */
function Pagination({
  page = 1,
  pageCount = 1,
  pageSize,
  total,
  onChange,
  style,
  ...rest
}) {
  const go = p => onChange && p >= 1 && p <= pageCount && p !== page && onChange(p);
  const pages = pageWindow(page, pageCount);
  const from = pageSize ? (page - 1) * pageSize + 1 : null;
  const to = pageSize ? Math.min(page * pageSize, total ?? page * pageSize) : null;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      ...style
    }
  }, rest), total != null && /*#__PURE__*/React.createElement("span", {
    style: {
      font: `var(--fw-regular) var(--fs-body-sm)/1 var(--font-body)`,
      color: "var(--text-muted)"
    }
  }, from, "\u2013", to, " of ", total.toLocaleString()), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(PageBtn, {
    disabled: page <= 1,
    onClick: () => go(page - 1),
    "aria-label": "Previous page"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "m15 18-6-6 6-6"
  }))), pages.map((p, i) => p === "…" ? /*#__PURE__*/React.createElement("span", {
    key: `g${i}`,
    style: {
      padding: "0 6px",
      color: "var(--text-muted)"
    }
  }, "\u2026") : /*#__PURE__*/React.createElement(PageBtn, {
    key: p,
    active: p === page,
    onClick: () => go(p)
  }, p)), /*#__PURE__*/React.createElement(PageBtn, {
    disabled: page >= pageCount,
    onClick: () => go(page + 1),
    "aria-label": "Next page"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "m9 18 6-6-6-6"
  })))));
}
function PageBtn({
  children,
  active,
  disabled,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", _extends({
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      minWidth: 32,
      height: 32,
      padding: "0 8px",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      border: `1px solid ${active ? "var(--kia-midnight)" : "var(--border-default)"}`,
      borderRadius: "var(--radius-md)",
      background: active ? "var(--kia-midnight)" : disabled ? "var(--disabled-bg)" : hover ? "var(--neutral-50)" : "var(--surface-card)",
      color: active ? "#fff" : disabled ? "var(--text-disabled)" : "var(--text-secondary)",
      font: `var(--fw-medium) var(--fs-body-sm)/1 var(--font-body)`,
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "background var(--dur-fast)",
      ...style
    }
  }, rest), children);
}
function pageWindow(page, count) {
  if (count <= 7) return Array.from({
    length: count
  }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, "…", count];
  if (page >= count - 3) return [1, "…", count - 4, count - 3, count - 2, count - 1, count];
  return [1, "…", page - 1, page, page + 1, "…", count];
}
Object.assign(__ds_scope, { Pagination });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Pagination.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SideNav.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * SideNav — primary Midnight-black navigation rail.
 * items: [{ key, label, icon?(lucide path d), badge? }]
 * groups optional via sections: [{ title, items }]
 */
function SideNav({
  items,
  sections,
  activeKey,
  onSelect,
  collapsed = false,
  footer,
  header,
  style,
  ...rest
}) {
  const renderItem = it => {
    const active = it.key === activeKey;
    return /*#__PURE__*/React.createElement(NavItem, {
      key: it.key,
      item: it,
      active: active,
      collapsed: collapsed,
      onSelect: onSelect
    });
  };
  return /*#__PURE__*/React.createElement("nav", _extends({
    style: {
      width: collapsed ? "var(--sidenav-collapsed)" : "var(--sidenav-width)",
      height: "100%",
      background: "var(--kia-midnight)",
      color: "var(--text-inverse)",
      display: "flex",
      flexDirection: "column",
      flex: "none",
      transition: "width var(--dur-base) var(--ease-standard)",
      ...style
    }
  }, rest), header && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: collapsed ? "16px 0" : "16px",
      display: "flex",
      justifyContent: collapsed ? "center" : "flex-start",
      flex: "none"
    }
  }, header), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: "8px"
    }
  }, sections ? sections.map((sec, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      marginBottom: 12
    }
  }, !collapsed && sec.title && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "8px 12px 4px",
      font: "var(--fw-semibold) 10px/1 var(--font-body)",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.4)"
    }
  }, sec.title), sec.items.map(renderItem))) : (items || []).map(renderItem)), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 8,
      borderTop: "1px solid rgba(255,255,255,0.08)",
      flex: "none"
    }
  }, footer));
}
function NavItem({
  item,
  active,
  collapsed,
  onSelect
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    title: collapsed ? item.label : undefined,
    onClick: () => onSelect && onSelect(item.key),
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      width: "100%",
      height: 40,
      padding: collapsed ? 0 : "0 12px",
      justifyContent: collapsed ? "center" : "flex-start",
      border: "none",
      borderRadius: "var(--radius-md)",
      cursor: "pointer",
      textAlign: "left",
      background: active ? "rgba(255,255,255,0.12)" : hover ? "rgba(255,255,255,0.06)" : "transparent",
      color: active ? "#fff" : "rgba(255,255,255,0.72)",
      font: `${active ? "var(--fw-semibold)" : "var(--fw-medium)"} var(--fs-body-md)/1 var(--font-body)`,
      position: "relative",
      transition: "background var(--dur-fast)"
    }
  }, active && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 0,
      top: 8,
      bottom: 8,
      width: 3,
      borderRadius: "0 2px 2px 0",
      background: "var(--accent-300)"
    }
  }), item.icon && /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.85",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      flex: "none"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: item.icon
  })), !collapsed && /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, item.label), !collapsed && item.badge != null && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--fw-semibold) 11px/1 var(--font-body)",
      background: "rgba(255,255,255,0.14)",
      color: "#fff",
      padding: "2px 7px",
      borderRadius: "var(--radius-pill)"
    }
  }, item.badge));
}
Object.assign(__ds_scope, { SideNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SideNav.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Tabs — underline tab bar. tabs: [{ key, label, badge? }] */
function Tabs({
  tabs = [],
  activeKey,
  onChange,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "tablist",
    style: {
      display: "flex",
      alignItems: "center",
      gap: 4,
      borderBottom: "1px solid var(--border-subtle)",
      ...style
    }
  }, rest), tabs.map(t => {
    const active = t.key === activeKey;
    return /*#__PURE__*/React.createElement(Tab, {
      key: t.key,
      tab: t,
      active: active,
      onChange: onChange
    });
  }));
}
function Tab({
  tab,
  active,
  onChange
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    role: "tab",
    "aria-selected": active,
    onClick: () => onChange && onChange(tab.key),
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: "relative",
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      height: 40,
      padding: "0 14px",
      border: "none",
      background: "transparent",
      cursor: "pointer",
      font: `${active ? "var(--fw-semibold)" : "var(--fw-medium)"} var(--fs-body-md)/1 var(--font-body)`,
      color: active ? "var(--text-primary)" : hover ? "var(--text-secondary)" : "var(--text-muted)",
      transition: "color var(--dur-fast)"
    }
  }, tab.label, tab.badge != null && /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--fw-semibold) 11px/1 var(--font-body)",
      color: active ? "var(--accent-700)" : "var(--text-muted)",
      background: active ? "var(--accent-50)" : "var(--neutral-100)",
      padding: "2px 6px",
      borderRadius: "var(--radius-pill)"
    }
  }, tab.badge), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 8,
      right: 8,
      bottom: -1,
      height: 2,
      borderRadius: "2px 2px 0 0",
      background: active ? "var(--kia-midnight)" : "transparent",
      transition: "background var(--dur-fast)"
    }
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/pqms/ApprovalBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * ApprovalBar — approval request panel with approve / reject / delegate.
 * Shows requester, step, and action buttons.
 */
function ApprovalBar({
  title = "Pending your approval",
  requester,
  step,
  onApprove,
  onReject,
  onDelegate,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      padding: "14px 16px",
      background: "var(--warning-50)",
      border: "1px solid #F4E2C0",
      borderRadius: "var(--radius-lg)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 36,
      height: 36,
      borderRadius: "50%",
      background: "var(--warning-500)",
      color: "#fff",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flex: "none"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 6v6l4 2"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: `var(--fw-semibold) var(--fs-body-md)/1.3 var(--font-body)`,
      color: "var(--warning-600)"
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      font: `var(--fw-regular) var(--fs-body-sm)/1.3 var(--font-body)`,
      color: "var(--text-secondary)"
    }
  }, requester && /*#__PURE__*/React.createElement(React.Fragment, null, "Requested by ", requester), requester && step && " · ", step))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      flex: "none"
    }
  }, onDelegate && /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "ghost",
    size: "sm",
    onClick: onDelegate
  }, "Delegate"), onReject && /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "secondary",
    size: "sm",
    onClick: onReject
  }, "Reject"), onApprove && /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "primary",
    size: "sm",
    onClick: onApprove
  }, "Approve")));
}
Object.assign(__ds_scope, { ApprovalBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/pqms/ApprovalBar.jsx", error: String((e && e.message) || e) }); }

// components/pqms/CommentCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * CommentCard — a single comment in an issue discussion / audit log.
 */
function CommentCard({
  author,
  role,
  time,
  children,
  internal = false,
  style,
  ...rest
}) {
  const initials = (author || "?").split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      gap: 12,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 32,
      height: 32,
      borderRadius: "50%",
      background: "var(--kia-midnight-70)",
      color: "#fff",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flex: "none",
      font: "var(--fw-semibold) 12px/1 var(--font-body)"
    }
  }, initials), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 8,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: `var(--fw-semibold) var(--fs-body-md)/1 var(--font-body)`,
      color: "var(--text-primary)"
    }
  }, author), role && /*#__PURE__*/React.createElement("span", {
    style: {
      font: `var(--fw-medium) var(--fs-caption)/1 var(--font-body)`,
      color: "var(--text-muted)"
    }
  }, role), internal && /*#__PURE__*/React.createElement("span", {
    style: {
      font: `var(--fw-semibold) 10px/1 var(--font-body)`,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: "var(--warning-600)",
      background: "var(--warning-50)",
      padding: "2px 6px",
      borderRadius: "var(--radius-sm)"
    }
  }, "Internal"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: `var(--fw-regular) var(--fs-caption)/1 var(--font-body)`,
      color: "var(--text-muted)",
      marginLeft: "auto"
    }
  }, time)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      padding: "10px 12px",
      background: internal ? "var(--warning-50)" : "var(--surface-sunken)",
      border: `1px solid ${internal ? "#F4E2C0" : "var(--border-subtle)"}`,
      borderRadius: "var(--radius-md)",
      font: `var(--fw-regular) var(--fs-body-md)/1.5 var(--font-body)`,
      color: "var(--text-primary)",
      textWrap: "pretty"
    }
  }, children)));
}
Object.assign(__ds_scope, { CommentCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/pqms/CommentCard.jsx", error: String((e && e.message) || e) }); }

// components/pqms/DataTable.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * DataTable — dense enterprise table with sortable columns, row selection,
 * compact/default density, and zebra-free hairline rows.
 *
 * columns: [{ key, header, width?, align?, sortable?, render?(row) }]
 * rows: array of objects keyed by column.key
 */
function DataTable({
  columns = [],
  rows = [],
  density = "default",
  selectable = false,
  selectedIds = [],
  onToggleRow,
  onToggleAll,
  rowKey = "id",
  sort,
  onSort,
  style,
  ...rest
}) {
  const rowH = density === "compact" ? "var(--row-height-compact)" : "var(--row-height-default)";
  const allChecked = selectable && rows.length > 0 && rows.every(r => selectedIds.includes(r[rowKey]));
  const someChecked = selectable && selectedIds.length > 0 && !allChecked;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-lg)",
      overflow: "hidden",
      background: "var(--surface-card)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      fontFamily: "var(--font-body)"
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: "var(--surface-sunken)",
      borderBottom: "1px solid var(--border-default)"
    }
  }, selectable && /*#__PURE__*/React.createElement("th", {
    style: {
      width: 44,
      padding: "0 0 0 16px",
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement(HeaderCheckbox, {
    checked: allChecked,
    indeterminate: someChecked,
    onChange: onToggleAll
  })), columns.map(c => {
    const active = sort?.key === c.key;
    return /*#__PURE__*/React.createElement("th", {
      key: c.key,
      style: {
        height: 40,
        padding: "0 16px",
        textAlign: c.align || "left",
        width: c.width,
        whiteSpace: "nowrap",
        font: `var(--fw-semibold) var(--fs-caption)/1 var(--font-body)`,
        letterSpacing: "0.03em",
        textTransform: "uppercase",
        color: "var(--text-muted)",
        cursor: c.sortable ? "pointer" : "default",
        userSelect: "none"
      },
      onClick: () => c.sortable && onSort && onSort(c.key)
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        justifyContent: c.align === "right" ? "flex-end" : "flex-start"
      }
    }, c.header, c.sortable && /*#__PURE__*/React.createElement("svg", {
      width: "13",
      height: "13",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      style: {
        color: active ? "var(--accent-500)" : "var(--neutral-400)"
      }
    }, active && sort.dir === "asc" ? /*#__PURE__*/React.createElement("path", {
      d: "m18 15-6-6-6 6"
    }) : active && sort.dir === "desc" ? /*#__PURE__*/React.createElement("path", {
      d: "m6 9 6 6 6-6"
    }) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "m8 9 4-4 4 4"
    }), /*#__PURE__*/React.createElement("path", {
      d: "m16 15-4 4-4-4"
    })))));
  }))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, i) => {
    const id = r[rowKey];
    const checked = selectedIds.includes(id);
    return /*#__PURE__*/React.createElement(Row, {
      key: id ?? i,
      rowH: rowH,
      last: i === rows.length - 1,
      selected: checked
    }, selectable && /*#__PURE__*/React.createElement("td", {
      style: {
        width: 44,
        padding: "0 0 0 16px"
      }
    }, /*#__PURE__*/React.createElement(HeaderCheckbox, {
      checked: checked,
      onChange: () => onToggleRow && onToggleRow(id)
    })), columns.map(c => /*#__PURE__*/React.createElement("td", {
      key: c.key,
      style: {
        padding: "0 16px",
        textAlign: c.align || "left",
        font: `var(--fw-regular) var(--fs-body-md)/1.4 var(--font-body)`,
        color: "var(--text-primary)",
        whiteSpace: "nowrap",
        fontVariantNumeric: c.align === "right" ? "tabular-nums" : "normal"
      }
    }, c.render ? c.render(r) : r[c.key])));
  }))));
}
function Row({
  children,
  rowH,
  last,
  selected
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("tr", {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      height: rowH,
      borderBottom: last ? "none" : "1px solid var(--border-subtle)",
      background: selected ? "var(--selected-bg)" : hover ? "var(--hover-overlay)" : "transparent",
      transition: "background var(--dur-fast)"
    }
  }, children);
}
function HeaderCheckbox({
  checked,
  indeterminate,
  onChange
}) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate;
  }, [indeterminate]);
  const on = checked || indeterminate;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      display: "inline-flex",
      verticalAlign: "middle"
    }
  }, /*#__PURE__*/React.createElement("input", {
    ref: ref,
    type: "checkbox",
    checked: checked,
    onChange: onChange,
    style: {
      position: "absolute",
      opacity: 0,
      width: 16,
      height: 16,
      margin: 0,
      cursor: "pointer"
    }
  }), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": true,
    style: {
      width: 16,
      height: 16,
      borderRadius: "var(--radius-sm)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      background: on ? "var(--accent-500)" : "var(--surface-card)",
      border: `1.5px solid ${on ? "var(--accent-500)" : "var(--border-strong)"}`,
      color: "#fff"
    }
  }, indeterminate ? /*#__PURE__*/React.createElement("svg", {
    width: "10",
    height: "10",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "4",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12h14"
  })) : checked ? /*#__PURE__*/React.createElement("svg", {
    width: "10",
    height: "10",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "4",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6 9 17l-5-5"
  })) : null));
}
Object.assign(__ds_scope, { DataTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/pqms/DataTable.jsx", error: String((e && e.message) || e) }); }

// components/pqms/SeverityBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * SeverityBar — numeric severity score 0–10 as a segmented/continuous bar.
 * Color thresholds: ≥8 critical (red), ≥5 major (orange), ≥3 minor (yellow), else low (gray).
 */
function SeverityBar({
  score = 0,
  max = 10,
  showValue = true,
  width = 160,
  style,
  ...rest
}) {
  const pct = Math.max(0, Math.min(1, score / max));
  const color = score >= 8 ? "var(--danger-500)" : score >= 5 ? "var(--status-pending)" : score >= 3 ? "var(--status-monitor)" : "var(--neutral-400)";
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width,
      height: 6,
      borderRadius: "var(--radius-pill)",
      background: "var(--neutral-200)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      width: `${pct * 100}%`,
      background: color,
      borderRadius: "var(--radius-pill)",
      transition: "width var(--dur-slow) var(--ease-standard)"
    }
  })), showValue && /*#__PURE__*/React.createElement("span", {
    style: {
      font: `var(--fw-semibold) var(--fs-body-sm)/1 var(--font-mono)`,
      color: "var(--text-primary)",
      minWidth: 28,
      textAlign: "right"
    }
  }, score.toFixed(1)));
}
Object.assign(__ds_scope, { SeverityBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/pqms/SeverityBar.jsx", error: String((e && e.message) || e) }); }

// components/pqms/SeverityIndicator.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Severity level → color mapping (automotive QMS). */
const SEVERITY = {
  critical: {
    label: "Critical",
    color: "var(--danger-500)",
    tint: "var(--danger-50)",
    text: "var(--danger-600)"
  },
  major: {
    label: "Major",
    color: "var(--status-pending)",
    tint: "var(--warning-50)",
    text: "var(--warning-600)"
  },
  minor: {
    label: "Minor",
    color: "var(--status-monitor)",
    tint: "#FBF3D6",
    text: "#8A6D08"
  },
  low: {
    label: "Low",
    color: "var(--neutral-500)",
    tint: "var(--neutral-100)",
    text: "var(--neutral-700)"
  }
};

/** SeverityIndicator — severity level chip with leading triangle. */
function SeverityIndicator({
  level = "minor",
  size = "md",
  style,
  ...rest
}) {
  const s = SEVERITY[level] || SEVERITY.minor;
  const fs = size === "sm" ? "11px" : "var(--fs-caption)";
  const h = size === "sm" ? 18 : 22;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      height: h,
      padding: "0 8px",
      background: s.tint,
      color: s.text,
      borderRadius: "var(--radius-sm)",
      font: `var(--fw-semibold) ${fs}/1 var(--font-body)`,
      whiteSpace: "nowrap",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: s.color,
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "m21.7 18-9-15.6a1 1 0 0 0-1.7 0l-9 15.6a1 1 0 0 0 .9 1.5h18a1 1 0 0 0 .9-1.5Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 9v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 17h.01"
  })), s.label);
}
Object.assign(__ds_scope, { SEVERITY, SeverityIndicator });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/pqms/SeverityIndicator.jsx", error: String((e && e.message) || e) }); }

// components/pqms/SourceBadge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Source channel → icon + label (where the issue originated). */
const SOURCE = {
  field: {
    label: "Field",
    icon: "M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"
  },
  plant: {
    label: "Plant",
    icon: "M2 20h20M4 20V8l5 3V8l5 3V8l6 4v8"
  },
  supplier: {
    label: "Supplier",
    icon: "M5 17H3V7l9-4 9 4v10h-2M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0Zm10 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z"
  },
  audit: {
    label: "Audit",
    icon: "M9 11l3 3 8-8M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
  },
  warranty: {
    label: "Warranty",
    icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"
  }
};

/** SourceBadge — origin channel of an issue (subtle outline chip). */
function SourceBadge({
  source = "field",
  size = "md",
  style,
  ...rest
}) {
  const s = SOURCE[source] || SOURCE.field;
  const fs = size === "sm" ? "11px" : "var(--fs-caption)";
  const ic = size === "sm" ? 12 : 14;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      height: size === "sm" ? 18 : 22,
      padding: "0 8px",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-sm)",
      background: "var(--surface-card)",
      color: "var(--text-secondary)",
      font: `var(--fw-medium) ${fs}/1 var(--font-body)`,
      whiteSpace: "nowrap",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("svg", {
    width: ic,
    height: ic,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.9",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: s.icon
  })), s.label);
}
Object.assign(__ds_scope, { SOURCE, SourceBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/pqms/SourceBadge.jsx", error: String((e && e.message) || e) }); }

// components/pqms/IssueCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * IssueCard — summary card for a quality issue. Composes StatusBadge,
 * SeverityBar, and SourceBadge. Selectable / clickable.
 */
function IssueCard({
  id,
  title,
  part,
  status = "open",
  severity = 5,
  source = "field",
  assignee,
  age,
  selected = false,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
      padding: 16,
      background: "var(--surface-card)",
      border: `1px solid ${selected ? "var(--accent-300)" : "var(--border-subtle)"}`,
      borderLeft: `3px solid ${selected ? "var(--accent-500)" : "transparent"}`,
      borderRadius: "var(--radius-lg)",
      boxShadow: hover ? "var(--shadow-md)" : "var(--shadow-sm)",
      cursor: onClick ? "pointer" : "default",
      transition: "box-shadow var(--dur-base), border-color var(--dur-base)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: `var(--fw-semibold) var(--fs-caption)/1 var(--font-mono)`,
      color: "var(--text-muted)"
    }
  }, id), /*#__PURE__*/React.createElement(__ds_scope.SourceBadge, {
    source: source,
    size: "sm"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      font: `var(--fw-semibold) var(--fs-body-md)/1.35 var(--font-body)`,
      color: "var(--text-primary)",
      textWrap: "pretty"
    }
  }, title), part && /*#__PURE__*/React.createElement("div", {
    style: {
      font: `var(--fw-regular) var(--fs-body-sm)/1.4 var(--font-body)`,
      color: "var(--text-muted)",
      marginTop: 2
    }
  }, part)), /*#__PURE__*/React.createElement(__ds_scope.StatusBadge, {
    status: status,
    size: "sm"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: `var(--fw-semibold) 10px/1 var(--font-body)`,
      letterSpacing: "0.05em",
      textTransform: "uppercase",
      color: "var(--text-muted)"
    }
  }, "Severity"), /*#__PURE__*/React.createElement(__ds_scope.SeverityBar, {
    score: severity,
    width: 120
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, age && /*#__PURE__*/React.createElement("span", {
    style: {
      font: `var(--fw-regular) var(--fs-caption)/1 var(--font-body)`,
      color: "var(--text-muted)"
    }
  }, age), assignee && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      font: `var(--fw-medium) var(--fs-body-sm)/1 var(--font-body)`,
      color: "var(--text-secondary)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 22,
      height: 22,
      borderRadius: "50%",
      background: "var(--kia-midnight-70)",
      color: "#fff",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      font: "var(--fw-semibold) 9px/1 var(--font-body)"
    }
  }, assignee.split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase()), assignee))));
}
Object.assign(__ds_scope, { IssueCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/pqms/IssueCard.jsx", error: String((e && e.message) || e) }); }

// components/pqms/Timeline.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Timeline — vertical activity / audit trail.
 * items: [{ icon?, title, meta?, time, tone? }]  tone: default|accent|success|warning|danger
 */
function Timeline({
  items = [],
  style,
  ...rest
}) {
  const tones = {
    default: "var(--neutral-400)",
    accent: "var(--accent-500)",
    success: "var(--success-500)",
    warning: "var(--warning-500)",
    danger: "var(--danger-500)"
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      ...style
    }
  }, rest), items.map((it, i) => {
    const last = i === items.length - 1;
    const dot = tones[it.tone] || tones.default;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: "flex",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flex: "none"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 12,
        height: 12,
        borderRadius: "50%",
        background: "var(--surface-card)",
        border: `2.5px solid ${dot}`,
        marginTop: 3,
        flex: "none"
      }
    }), !last && /*#__PURE__*/React.createElement("span", {
      style: {
        width: 2,
        flex: 1,
        background: "var(--border-subtle)",
        minHeight: 20
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        paddingBottom: last ? 0 : 18,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        font: `var(--fw-medium) var(--fs-body-md)/1.4 var(--font-body)`,
        color: "var(--text-primary)"
      }
    }, it.title), it.meta && /*#__PURE__*/React.createElement("div", {
      style: {
        font: `var(--fw-regular) var(--fs-body-sm)/1.4 var(--font-body)`,
        color: "var(--text-secondary)",
        marginTop: 2
      }
    }, it.meta), /*#__PURE__*/React.createElement("div", {
      style: {
        font: `var(--fw-regular) var(--fs-caption)/1 var(--font-body)`,
        color: "var(--text-muted)",
        marginTop: 4
      }
    }, it.time)));
  }));
}
Object.assign(__ds_scope, { Timeline });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/pqms/Timeline.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.STATUS = __ds_scope.STATUS;

__ds_ns.StatusBadge = __ds_scope.StatusBadge;

__ds_ns.StatusIndicator = __ds_scope.StatusIndicator;

__ds_ns.StatusPill = __ds_scope.StatusPill;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.STATUS_SIZES = __ds_scope.STATUS_SIZES;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.Spinner = __ds_scope.Spinner;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.SearchField = __ds_scope.SearchField;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.Breadcrumb = __ds_scope.Breadcrumb;

__ds_ns.Header = __ds_scope.Header;

__ds_ns.Pagination = __ds_scope.Pagination;

__ds_ns.SideNav = __ds_scope.SideNav;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.ApprovalBar = __ds_scope.ApprovalBar;

__ds_ns.CommentCard = __ds_scope.CommentCard;

__ds_ns.DataTable = __ds_scope.DataTable;

__ds_ns.IssueCard = __ds_scope.IssueCard;

__ds_ns.SeverityBar = __ds_scope.SeverityBar;

__ds_ns.SEVERITY = __ds_scope.SEVERITY;

__ds_ns.SeverityIndicator = __ds_scope.SeverityIndicator;

__ds_ns.SOURCE = __ds_scope.SOURCE;

__ds_ns.SourceBadge = __ds_scope.SourceBadge;

__ds_ns.Timeline = __ds_scope.Timeline;

})();
