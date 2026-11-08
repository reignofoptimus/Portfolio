import { LiquidAccordion } from "@/components/ui/liquid-glass-accordion"



const FAQ = [

  {

    question: "What is Nimbus UI?",

    answer: "A free React component library in Frutiger Aero × liquid glass. Every piece runs on the same tiny WebGL water engine.",

  },

  {

    question: "Is the water real?",

    answer: "It's a shader, not a video. The pool is simulated: it stretches, pinches into droplets and lands with a ripple.",

  },

  {

    question: "Does it work without WebGL?",

    answer: "Yes. It falls back to a soft CSS pool, and it respects reduced motion.",

  },

  {

    question: "Any dependencies?",

    answer: "Only React. TypeScript strict, keyboard and screen-reader friendly.",

  },

  {

    question: "Can I use it in commercial projects?",

    answer: "Yes, it's MIT. A credit is always appreciated.",

  },

]



export default function Demo() {

  return (

    <div

      style={{

        minHeight: "100vh",

        width: "100%",

        display: "flex",

        flexDirection: "column",

        alignItems: "center",

        justifyContent: "center",

        gap: 28,

        padding: "48px 16px",

        boxSizing: "border-box",

        overflowX: "hidden",

        background: "#DCEBF5",

      }}

    >

      <LiquidAccordion items={FAQ} defaultOpen={0} tone="light" style={{ maxWidth: 560 }} />

      <span

        style={{

          font: "500 12px/1 ui-sans-serif, -apple-system, 'Segoe UI', system-ui, sans-serif",

          color: "rgba(11,19,43,.5)",

        }}

      >

        Nimbus UI · by{" "}

        <a href="https://guglielmogiannattasio.it" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(11,19,43,.7)" }}>

          guglielmogiannattasio.it

        </a>

      </span>

    </div>

  )

}
