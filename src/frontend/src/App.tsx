import { useCallback, useEffect, useState } from "react";
import type { Subject, Topic, backendInterface } from "./backend.d";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Progress } from "./components/ui/progress";
import { useActor } from "./hooks/useActor";
import "./app.css";

// ─── Seed Data ───────────────────────────────────────────────────────────────
const SEED_SUBJECTS = [
  { id: 1n, name: "Math" },
  { id: 2n, name: "Science" },
  { id: 3n, name: "Biology" },
  { id: 4n, name: "Physics" },
  { id: 5n, name: "Chemistry" },
  { id: 6n, name: "History" },
  { id: 7n, name: "Computer Science" },
  { id: 8n, name: "Economics" },
  { id: 9n, name: "Literature" },
  { id: 10n, name: "Geography" },
];

const SEED_TOPICS: Array<{
  id: bigint;
  subjectId: bigint;
  title: string;
  description: string;
  keyPoints: string[];
  category: string;
}> = [
  // Math
  {
    id: 1n,
    subjectId: 1n,
    title: "Pythagorean Theorem",
    description:
      "The Pythagorean theorem states that in a right-angled triangle, the square of the hypotenuse equals the sum of squares of the other two sides. It is one of the most fundamental relationships in Euclidean geometry and has countless real-world applications.",
    keyPoints: [
      "a² + b² = c²",
      "Only applies to right triangles",
      "Used in architecture, navigation, and physics",
      "Named after Greek mathematician Pythagoras",
      "Can be proved in over 370 different ways",
    ],
    category: "Geometry",
  },
  {
    id: 2n,
    subjectId: 1n,
    title: "Quadratic Equations",
    description:
      "A quadratic equation is a polynomial equation of degree two, written as ax² + bx + c = 0. They appear in physics, engineering, and economics to model parabolic paths and optimize values.",
    keyPoints: [
      "Standard form: ax² + bx + c = 0",
      "Solved by factoring, completing the square, or the quadratic formula",
      "Discriminant determines number of real solutions",
      "Graph is always a parabola",
      "Used to model projectile motion",
    ],
    category: "Algebra",
  },
  {
    id: 3n,
    subjectId: 1n,
    title: "Derivatives & Calculus",
    description:
      "Calculus is the mathematical study of change. Derivatives measure how a function changes as its input changes, giving us the instantaneous rate of change or slope at any point.",
    keyPoints: [
      "Derivative = rate of change",
      "Power rule: d/dx(xⁿ) = nxⁿ⁻¹",
      "Used to find maxima and minima",
      "Chain rule for composite functions",
      "Foundation of physics and engineering",
    ],
    category: "Calculus",
  },
  // Science
  {
    id: 4n,
    subjectId: 2n,
    title: "Newton's Laws of Motion",
    description:
      "Newton's three laws of motion describe the relationship between objects and the forces acting on them. Published in 1687, they form the foundation of classical mechanics.",
    keyPoints: [
      "1st: An object at rest stays at rest (inertia)",
      "2nd: F = ma (force equals mass times acceleration)",
      "3rd: Every action has an equal and opposite reaction",
      "Basis of classical mechanics",
      "Apply to everyday motion at normal speeds",
    ],
    category: "Physics",
  },
  {
    id: 5n,
    subjectId: 2n,
    title: "The Scientific Method",
    description:
      "The scientific method is a systematic process for investigating phenomena, acquiring new knowledge, or correcting and integrating previous knowledge. It ensures results are objective and reproducible.",
    keyPoints: [
      "Observation → Question → Hypothesis",
      "Experiment must be controlled and repeatable",
      "Data analysis leads to conclusions",
      "Peer review validates findings",
      "Basis of all modern science",
    ],
    category: "Methodology",
  },
  {
    id: 6n,
    subjectId: 2n,
    title: "States of Matter",
    description:
      "Matter exists in four primary states: solid, liquid, gas, and plasma. The state depends on temperature and pressure, which affect how tightly particles are packed and how they move.",
    keyPoints: [
      "Solid: fixed shape & volume",
      "Liquid: fixed volume, variable shape",
      "Gas: variable shape & volume",
      "Plasma: ionized gas, most common in universe",
      "Phase transitions require energy (latent heat)",
    ],
    category: "Chemistry",
  },
  // Biology
  {
    id: 7n,
    subjectId: 3n,
    title: "Cell Structure",
    description:
      "The cell is the basic unit of life. Cells contain specialized structures called organelles that perform specific functions to keep the cell alive and functioning properly.",
    keyPoints: [
      "Nucleus contains DNA",
      "Mitochondria = powerhouse of the cell",
      "Cell membrane controls what enters/exits",
      "Plant cells have cell walls & chloroplasts",
      "Prokaryotes lack a membrane-bound nucleus",
    ],
    category: "Cell Biology",
  },
  {
    id: 8n,
    subjectId: 3n,
    title: "Photosynthesis",
    description:
      "Photosynthesis is the process by which plants, algae, and some bacteria convert light energy into chemical energy stored as glucose. It is the foundation of almost all food chains on Earth.",
    keyPoints: [
      "6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂",
      "Occurs in chloroplasts",
      "Chlorophyll absorbs red & blue light",
      "Light-dependent and light-independent reactions",
      "Produces oxygen as a byproduct",
    ],
    category: "Plant Biology",
  },
  {
    id: 9n,
    subjectId: 3n,
    title: "DNA & Genetics",
    description:
      "DNA (deoxyribonucleic acid) is the molecule that carries genetic information in all living organisms. Genetics is the study of heredity and the variation of inherited characteristics.",
    keyPoints: [
      "Double helix structure discovered by Watson & Crick",
      "Made of nucleotides: A, T, G, C",
      "Genes are segments of DNA encoding proteins",
      "Mendelian inheritance: dominant & recessive traits",
      "Mutations drive evolution",
    ],
    category: "Genetics",
  },
  // Physics
  {
    id: 10n,
    subjectId: 4n,
    title: "Gravity",
    description:
      "Gravity is the force that attracts objects with mass toward each other. Newton described it mathematically, and Einstein later explained it as a curvature of spacetime in his General Theory of Relativity.",
    keyPoints: [
      "F = Gm₁m₂/r² (Newton's law)",
      "Earth's gravity: 9.8 m/s²",
      "Keeps planets in orbit",
      "Einstein: gravity is curved spacetime",
      "Weakest of the four fundamental forces",
    ],
    category: "Mechanics",
  },
  {
    id: 11n,
    subjectId: 4n,
    title: "Electromagnetic Waves",
    description:
      "Electromagnetic waves are waves of oscillating electric and magnetic fields that travel through space at the speed of light. The electromagnetic spectrum includes radio waves, visible light, and X-rays.",
    keyPoints: [
      "Travel at speed of light: 3×10⁸ m/s",
      "Do not require a medium to travel",
      "Spectrum: radio, microwave, IR, visible, UV, X-ray, gamma",
      "Frequency and wavelength are inversely proportional",
      "Basis of wireless communication & optics",
    ],
    category: "Electromagnetism",
  },
  {
    id: 12n,
    subjectId: 4n,
    title: "Quantum Mechanics",
    description:
      "Quantum mechanics describes the behavior of matter and energy at atomic and subatomic scales. It reveals a world fundamentally different from classical physics, governed by probabilities.",
    keyPoints: [
      "Wave-particle duality",
      "Heisenberg uncertainty principle",
      "Schrödinger's equation governs quantum states",
      "Quantized energy levels in atoms",
      "Basis of semiconductors and lasers",
    ],
    category: "Quantum Physics",
  },
  // Chemistry
  {
    id: 13n,
    subjectId: 5n,
    title: "The Periodic Table",
    description:
      "The periodic table organizes all known chemical elements by atomic number, electron configuration, and recurring chemical properties. It is the most important tool in chemistry.",
    keyPoints: [
      "118 known elements",
      "Organized by increasing atomic number",
      "Periods = horizontal rows, Groups = vertical columns",
      "Elements in same group have similar properties",
      "Dmitri Mendeleev created the first version in 1869",
    ],
    category: "Inorganic Chemistry",
  },
  {
    id: 14n,
    subjectId: 5n,
    title: "Chemical Bonding",
    description:
      "Chemical bonds are the forces that hold atoms together to form molecules and compounds. The type of bonding determines a substance's properties, from melting point to electrical conductivity.",
    keyPoints: [
      "Ionic bonds: electron transfer (metal + nonmetal)",
      "Covalent bonds: electron sharing (nonmetals)",
      "Metallic bonds: sea of electrons",
      "Hydrogen bonds give water unique properties",
      "Bond energy determines chemical stability",
    ],
    category: "Physical Chemistry",
  },
  {
    id: 15n,
    subjectId: 5n,
    title: "Acids & Bases",
    description:
      "Acids and bases are two classes of chemical compounds with opposite properties. The pH scale measures acidity from 0 (most acidic) to 14 (most basic), with 7 being neutral.",
    keyPoints: [
      "Acids donate H⁺ ions; bases accept H⁺",
      "pH scale: 0-14, neutral = 7",
      "Neutralization: acid + base → salt + water",
      "Strong acids fully dissociate (HCl, H₂SO₄)",
      "Buffer solutions resist pH changes",
    ],
    category: "Analytical Chemistry",
  },
  // History
  {
    id: 16n,
    subjectId: 6n,
    title: "The Renaissance",
    description:
      "The Renaissance was a cultural and intellectual movement in Europe from the 14th to 17th centuries. It marked the transition from the Middle Ages to modernity, celebrating humanism, art, and scientific inquiry.",
    keyPoints: [
      "Began in Italy in the 14th century",
      "Humanist philosophy centered on human potential",
      "Produced Da Vinci, Michelangelo, Raphael",
      "Printing press spread Renaissance ideas",
      "Led to the Scientific Revolution",
    ],
    category: "European History",
  },
  {
    id: 17n,
    subjectId: 6n,
    title: "World War II",
    description:
      "World War II (1939–1945) was the deadliest conflict in human history, involving most of the world's nations. It ended with the defeat of Nazi Germany and Imperial Japan and reshaped the global political order.",
    keyPoints: [
      "1939–1945, involved 30+ countries",
      "Holocaust: genocide of 6 million Jews",
      "D-Day invasion: June 6, 1944",
      "Atomic bombs dropped on Hiroshima and Nagasaki",
      "Led to the United Nations and Cold War",
    ],
    category: "Modern History",
  },
  {
    id: 18n,
    subjectId: 6n,
    title: "The Industrial Revolution",
    description:
      "The Industrial Revolution (1760–1840) transformed manufacturing from hand production to machine-based processes. Originating in Britain, it fundamentally changed economies, societies, and the environment.",
    keyPoints: [
      "Began in Britain around 1760",
      "Steam engine transformed transportation",
      "Rise of factories and urbanization",
      "Child labor and poor working conditions",
      "Led to modern capitalism and labor movements",
    ],
    category: "Economic History",
  },
  // Computer Science
  {
    id: 19n,
    subjectId: 7n,
    title: "Algorithms & Big-O",
    description:
      "An algorithm is a step-by-step procedure to solve a problem. Big-O notation describes how an algorithm's time or space requirements grow as the input size increases, helping compare efficiency.",
    keyPoints: [
      "O(1) = constant time",
      "O(n) = linear time",
      "O(log n) = logarithmic (e.g., binary search)",
      "O(n²) = quadratic (e.g., bubble sort)",
      "Trade-off between time and space complexity",
    ],
    category: "Algorithms",
  },
  {
    id: 20n,
    subjectId: 7n,
    title: "How the Internet Works",
    description:
      "The internet is a global network of computers communicating via standardized protocols. Data travels in packets through routers and switches, guided by IP addresses and domain names.",
    keyPoints: [
      "TCP/IP protocol suite",
      "DNS translates domain names to IP addresses",
      "HTTP/HTTPS powers the World Wide Web",
      "Data travels in packets through routers",
      "Submarine cables carry ~95% of internet traffic",
    ],
    category: "Networking",
  },
  {
    id: 21n,
    subjectId: 7n,
    title: "Machine Learning Basics",
    description:
      "Machine learning is a subset of AI where systems learn from data to make predictions or decisions without being explicitly programmed. It powers recommendation systems, image recognition, and more.",
    keyPoints: [
      "Supervised, unsupervised, and reinforcement learning",
      "Training data teaches the model patterns",
      "Neural networks mimic the human brain",
      "Overfitting = model too specific to training data",
      "Used in search engines, self-driving cars, medical diagnosis",
    ],
    category: "Artificial Intelligence",
  },
  // Economics
  {
    id: 22n,
    subjectId: 8n,
    title: "Supply & Demand",
    description:
      "Supply and demand is the core model of market economies. The price of goods is determined where the quantity supplied equals the quantity demanded, known as the equilibrium point.",
    keyPoints: [
      "Higher price → less demand (inverse relationship)",
      "Higher price → more supply (direct relationship)",
      "Equilibrium: where supply meets demand",
      "Shifts caused by income, preferences, production costs",
      "Foundation of microeconomics",
    ],
    category: "Microeconomics",
  },
  {
    id: 23n,
    subjectId: 8n,
    title: "Inflation",
    description:
      "Inflation is the rate at which the general level of prices for goods and services rises over time, decreasing purchasing power. Central banks target low, stable inflation to maintain economic health.",
    keyPoints: [
      "Measured by Consumer Price Index (CPI)",
      "Caused by demand-pull or cost-push factors",
      "Hyperinflation: extreme, uncontrolled inflation",
      "Central banks raise interest rates to control inflation",
      "Moderate inflation (~2%) is considered healthy",
    ],
    category: "Macroeconomics",
  },
  {
    id: 24n,
    subjectId: 8n,
    title: "GDP Explained",
    description:
      "Gross Domestic Product (GDP) measures the total monetary value of all goods and services produced within a country in a specific time period. It is the primary indicator of economic health.",
    keyPoints: [
      "GDP = C + I + G + (X - M)",
      "C = consumer spending, I = investment, G = government",
      "Real GDP adjusts for inflation",
      "GDP per capita measures average living standards",
      "Recession = two consecutive quarters of negative GDP growth",
    ],
    category: "Macroeconomics",
  },
  // Literature
  {
    id: 25n,
    subjectId: 9n,
    title: "Shakespeare's Works",
    description:
      "William Shakespeare (1564–1616) is widely regarded as the greatest writer in the English language. His 37 plays and 154 sonnets explore themes of love, power, jealousy, betrayal, and mortality.",
    keyPoints: [
      "37 plays: tragedies, comedies, histories",
      "Famous works: Hamlet, Romeo & Juliet, Macbeth",
      "Invented over 1,700 English words",
      "Wrote for the Globe Theatre in London",
      "Sonnets explore love, time, and beauty",
    ],
    category: "Classic Literature",
  },
  {
    id: 26n,
    subjectId: 9n,
    title: "Poetry Analysis",
    description:
      "Poetry analysis involves examining a poem's structure, language, imagery, and themes to understand its deeper meanings. Tools include meter, rhyme scheme, figurative language, and tone.",
    keyPoints: [
      "Meter: rhythm pattern of stressed/unstressed syllables",
      "Rhyme scheme: pattern of end rhymes (ABAB, AABB)",
      "Figurative language: metaphor, simile, personification",
      "Tone reveals the poet's attitude toward the subject",
      "Enjambment: line continues without pause to next",
    ],
    category: "Literary Analysis",
  },
  {
    id: 27n,
    subjectId: 9n,
    title: "Narrative Structure",
    description:
      "Narrative structure is the framework that organizes the events of a story. Understanding structure helps writers craft compelling stories and readers identify patterns across different works.",
    keyPoints: [
      "Freytag's Pyramid: exposition, rising action, climax, falling action, resolution",
      "In medias res: starting in the middle of the action",
      "Three-act structure used in film and drama",
      "Unreliable narrator challenges reader perception",
      "Nonlinear narratives use flashbacks/flash-forwards",
    ],
    category: "Narrative Theory",
  },
  // Geography
  {
    id: 28n,
    subjectId: 10n,
    title: "Plate Tectonics",
    description:
      "Plate tectonics is the theory that Earth's outer shell is divided into several large plates that move and interact, causing earthquakes, volcanic eruptions, and the formation of mountain ranges.",
    keyPoints: [
      "Earth has 7 major and several minor plates",
      "Plates move 2-10 cm per year",
      "Convergent boundaries: plates collide (mountains/subduction)",
      "Divergent boundaries: plates separate (mid-ocean ridges)",
      "Transform boundaries: plates slide past each other (earthquakes)",
    ],
    category: "Physical Geography",
  },
  {
    id: 29n,
    subjectId: 10n,
    title: "Climate Zones",
    description:
      "Climate zones are regions of Earth with similar average temperatures, precipitation, and seasonal patterns. They are determined by latitude, elevation, proximity to water, and ocean currents.",
    keyPoints: [
      "5 main zones: tropical, dry, temperate, continental, polar",
      "Latitude is the primary determinant",
      "Koppen Climate Classification system",
      "Ocean currents moderate coastal climates",
      "Climate change is shifting zone boundaries",
    ],
    category: "Climatology",
  },
  {
    id: 30n,
    subjectId: 10n,
    title: "World Capitals",
    description:
      "World capitals are the cities that serve as the seat of government for their respective countries. They are centers of political, cultural, and often economic power, each with a unique story.",
    keyPoints: [
      "There are 195 countries with capitals",
      "Some countries have multiple capitals (e.g., South Africa has 3)",
      "Brasília was purpose-built as Brazil's capital in 1960",
      "Vatican City is both a country and a capital",
      "Tokyo is the world's most populous capital city",
    ],
    category: "Political Geography",
  },
];

// ─── Subject Metadata ────────────────────────────────────────────────────────
const SUBJECT_META: Record<
  string,
  { emoji: string; color: string; bg: string; border: string }
> = {
  Math: {
    emoji: "📐",
    color: "text-blue-400",
    bg: "bg-blue-950/40",
    border: "border-blue-500/30",
  },
  Science: {
    emoji: "🔬",
    color: "text-green-400",
    bg: "bg-green-950/40",
    border: "border-green-500/30",
  },
  Biology: {
    emoji: "🧬",
    color: "text-emerald-400",
    bg: "bg-emerald-950/40",
    border: "border-emerald-500/30",
  },
  Physics: {
    emoji: "⚛️",
    color: "text-cyan-400",
    bg: "bg-cyan-950/40",
    border: "border-cyan-500/30",
  },
  Chemistry: {
    emoji: "⚗️",
    color: "text-orange-400",
    bg: "bg-orange-950/40",
    border: "border-orange-500/30",
  },
  History: {
    emoji: "📜",
    color: "text-amber-400",
    bg: "bg-amber-950/40",
    border: "border-amber-500/30",
  },
  "Computer Science": {
    emoji: "💻",
    color: "text-violet-400",
    bg: "bg-violet-950/40",
    border: "border-violet-500/30",
  },
  Economics: {
    emoji: "📈",
    color: "text-pink-400",
    bg: "bg-pink-950/40",
    border: "border-pink-500/30",
  },
  Literature: {
    emoji: "📚",
    color: "text-rose-400",
    bg: "bg-rose-950/40",
    border: "border-rose-500/30",
  },
  Geography: {
    emoji: "🌍",
    color: "text-teal-400",
    bg: "bg-teal-950/40",
    border: "border-teal-500/30",
  },
};

const getSubjectMeta = (name: string) =>
  SUBJECT_META[name] ?? {
    emoji: "📖",
    color: "text-slate-400",
    bg: "bg-slate-900/40",
    border: "border-slate-500/30",
  };

// ─── Topic Animations ────────────────────────────────────────────────────────
function TopicAnimation({ subjectName }: { subjectName: string }) {
  switch (subjectName) {
    case "Math":
      return (
        <div className="anim-container">
          <div className="anim-shape triangle" />
          <div className="anim-shape square" />
          <div className="anim-shape circle" />
          <div className="anim-formula">a² + b² = c²</div>
        </div>
      );
    case "Science":
      return (
        <div className="anim-container">
          <div className="orbit-ring">
            <div className="orbit-particle" style={{ animationDelay: "0s" }} />
          </div>
          <div className="orbit-ring" style={{ width: 120, height: 120 }}>
            <div className="orbit-particle" style={{ animationDelay: "-1s" }} />
          </div>
          <div className="orbit-nucleus" />
        </div>
      );
    case "Biology":
      return (
        <div className="anim-container">
          <div className="dna-helix">
            {Array.from({ length: 8 }, (_, i) => i).map((i) => (
              <div
                key={i}
                className="dna-pair"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="dna-dot left" />
                <div className="dna-line" />
                <div className="dna-dot right" />
              </div>
            ))}
          </div>
        </div>
      );
    case "Physics":
      return (
        <div className="anim-container">
          <div className="gravity-ball" />
          <div className="wave-line">
            {Array.from({ length: 20 }, (_, i) => ({
              key: `wd${i}`,
              delay: i * 0.05,
            })).map(({ key, delay }) => (
              <div
                key={key}
                className="wave-dot"
                style={{ animationDelay: `${delay}s` }}
              />
            ))}
          </div>
        </div>
      );
    case "Chemistry":
      return (
        <div className="anim-container">
          <div className="molecule-center" />
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <div
              key={deg}
              className="molecule-arm"
              style={{ transform: `rotate(${deg}deg)` }}
            >
              <div className="molecule-atom" />
            </div>
          ))}
        </div>
      );
    case "History":
      return (
        <div className="anim-container">
          <div className="timeline-scroll">
            {["1300", "1500", "1700", "1900", "2000"].map((y) => (
              <div key={y} className="timeline-item">
                <div className="timeline-dot" />
                <span className="timeline-year">{y}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case "Computer Science":
      return (
        <div className="anim-container">
          <div className="code-stream">
            {["01001", "10110", "00111", "11010", "01101"].map((b, i) => (
              <div
                key={b}
                className="code-line"
                style={{ animationDelay: `${i * 0.3}s` }}
              >
                {b}
              </div>
            ))}
          </div>
        </div>
      );
    case "Economics":
      return (
        <div className="anim-container">
          <div className="chart-bars">
            {[
              { h: 40, d: 0 },
              { h: 65, d: 0.1 },
              { h: 45, d: 0.2 },
              { h: 80, d: 0.3 },
              { h: 55, d: 0.4 },
              { h: 90, d: 0.5 },
              { h: 70, d: 0.6 },
            ].map((bar) => (
              <div
                key={bar.d}
                className="chart-bar"
                style={{ height: `${bar.h}%`, animationDelay: `${bar.d}s` }}
              />
            ))}
          </div>
          <div className="chart-baseline" />
        </div>
      );
    case "Literature":
      return (
        <div className="anim-container">
          <div className="book-container">
            <div className="book-cover" />
            <div className="book-page page1" />
            <div className="book-page page2" />
            <div className="book-spine" />
          </div>
        </div>
      );
    case "Geography":
      return (
        <div className="anim-container">
          <div className="globe">
            <div className="globe-line" style={{ top: "25%" }} />
            <div className="globe-line" style={{ top: "50%" }} />
            <div className="globe-line" style={{ top: "75%" }} />
            <div className="globe-meridian" style={{ animationDelay: "0s" }} />
            <div
              className="globe-meridian"
              style={{ animationDelay: "-0.5s" }}
            />
          </div>
        </div>
      );
    default:
      return (
        <div className="anim-container">
          <div className="orbit-nucleus" style={{ width: 60, height: 60 }} />
        </div>
      );
  }
}

// ─── Views ───────────────────────────────────────────────────────────────────
type View =
  | { type: "home" }
  | { type: "subject"; subjectId: bigint }
  | { type: "topic"; topicId: bigint; subjectId: bigint }
  | { type: "search"; query: string };

export default function App() {
  const [view, setView] = useState<View>({ type: "home" });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeded, setSeeded] = useState(false);
  const { actor } = useActor();
  const api = actor as backendInterface;

  // seed & load
  // biome-ignore lint/correctness/useExhaustiveDependencies: api methods from actor
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const subs = await api.getAllSubjects();
        if (subs.length === 0 && !seeded) {
          setSeeded(true);
          for (const s of SEED_SUBJECTS) await api.addSubject(s.id, s.name);
          for (const t of SEED_TOPICS)
            await api.addTopic(
              t.id,
              t.subjectId,
              t.title,
              t.description,
              t.keyPoints,
              t.category,
            );
        }
        const [allSubs, viewed] = await Promise.all([
          api.getAllSubjects(),
          api.getViewedTopics(),
        ]);
        setSubjects(allSubs);
        setViewedIds(new Set(viewed.map(String)));
      } finally {
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seeded]);

  // load topics when entering a subject
  // biome-ignore lint/correctness/useExhaustiveDependencies: api methods from actor
  useEffect(() => {
    if (view.type === "subject") {
      api
        .getTopicsBySubject(
          (view as { type: "subject"; subjectId: bigint }).subjectId,
        )
        .then(setTopics);
    }
  }, [view, actor]);

  // search
  // biome-ignore lint/correctness/useExhaustiveDependencies: api methods from actor
  const doSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setSearchResults([]);
        return;
      }
      const res = await api.searchTopics(q);
      setSearchResults(res);
    },
    [api],
  );
  // biome-ignore lint/correctness/useExhaustiveDependencies: view.type intentional
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchQ.trim()) {
        doSearch(searchQ);
        setView({ type: "search", query: searchQ });
      } else if (view.type === "search") {
        setView({ type: "home" });
      }
    }, 350);
    return () => clearTimeout(t);
    // biome-ignore lint/correctness/useExhaustiveDependencies: view.type covers view
  }, [searchQ, doSearch, view.type, actor]);

  const markViewed = async (id: bigint) => {
    if (!viewedIds.has(String(id))) {
      await api.markTopicViewed(id);
      setViewedIds((prev) => new Set([...prev, String(id)]));
    }
  };

  const totalTopics = SEED_TOPICS.length;
  const progress = Math.round((viewedIds.size / totalTopics) * 100);

  if (loading) {
    return (
      <div
        className="min-h-screen bg-slate-950 flex items-center justify-center"
        data-ocid="app.loading_state"
      >
        <div className="text-center">
          <div className="loader-ring" />
          <p className="text-slate-400 mt-4 animate-pulse">
            Loading AcademiAnimate…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center gap-4">
        <button
          type="button"
          data-ocid="nav.home_link"
          onClick={() => {
            setView({ type: "home" });
            setSearchQ("");
          }}
          className="text-lg font-bold tracking-tight bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent flex-shrink-0"
        >
          AcademiAnimate
        </button>
        <div className="flex-1 max-w-md">
          <Input
            data-ocid="home.search_input"
            placeholder="Search any topic…"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 h-8 text-sm"
          />
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <span>
            {viewedIds.size}/{totalTopics} explored
          </span>
          <Progress value={progress} className="w-20 h-1.5" />
        </div>
      </nav>

      {/* Pages */}
      {view.type === "home" && (
        <HomePage
          subjects={subjects}
          viewedIds={viewedIds}
          totalTopics={totalTopics}
          progress={progress}
          onSelectSubject={(id) => setView({ type: "subject", subjectId: id })}
        />
      )}

      {view.type === "subject" && (
        <SubjectPage
          subjectId={view.subjectId}
          subjects={subjects}
          topics={topics}
          viewedIds={viewedIds}
          onBack={() => setView({ type: "home" })}
          onSelectTopic={(tid) =>
            setView({ type: "topic", topicId: tid, subjectId: view.subjectId })
          }
        />
      )}

      {view.type === "topic" && (
        <TopicPage
          topicId={view.topicId}
          subjectId={view.subjectId}
          subjects={subjects}
          topics={topics}
          viewedIds={viewedIds}
          onBack={() => setView({ type: "subject", subjectId: view.subjectId })}
          onMarkViewed={markViewed}
          onNavigate={(tid) =>
            setView({ type: "topic", topicId: tid, subjectId: view.subjectId })
          }
        />
      )}

      {view.type === "search" && (
        <SearchPage
          query={searchQ}
          results={searchResults}
          subjects={subjects}
          viewedIds={viewedIds}
          onSelectTopic={(t) =>
            setView({ type: "topic", topicId: t.id, subjectId: t.subjectId })
          }
        />
      )}
    </div>
  );
}

// ─── Home Page ───────────────────────────────────────────────────────────────
function HomePage({
  subjects,
  viewedIds,
  totalTopics,
  progress,
  onSelectSubject,
}: {
  subjects: Subject[];
  viewedIds: Set<string>;
  totalTopics: number;
  progress: number;
  onSelectSubject: (id: bigint) => void;
}) {
  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      {/* Hero */}
      <section className="relative text-center py-16 mb-12 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-slate-700">
        <div className="floating-shapes" aria-hidden>
          {[0, 0.7, 1.4, 2.1, 2.8, 3.5, 4.2, 4.9].map((delay, i) => (
            <div
              key={delay}
              className="floating-shape"
              style={{
                animationDelay: `${delay}s`,
                left: `${10 + i * 11}%`,
              }}
            />
          ))}
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Learn Anything, Animated
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Every academic topic explained visually with beautiful animations.
            From Math to Geography — explore it all.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Badge
              variant="secondary"
              className="bg-slate-800 text-slate-300 px-4 py-1"
            >
              {viewedIds.size} / {totalTopics} topics explored
            </Badge>
            <div className="w-32">
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </div>
      </section>

      {/* Subjects grid */}
      <h2 className="text-xl font-semibold text-slate-300 mb-6">
        Choose a Subject
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {subjects.map((s, i) => {
          const meta = getSubjectMeta(s.name);
          return (
            <button
              type="button"
              key={String(s.id)}
              data-ocid={`home.subject_card.${i + 1}`}
              onClick={() => onSelectSubject(s.id)}
              className={`subject-card group rounded-2xl p-5 text-left border ${meta.bg} ${meta.border} hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-black/30`}
            >
              <div className="text-3xl mb-3">{meta.emoji}</div>
              <div className={`font-semibold text-sm ${meta.color}`}>
                {s.name}
              </div>
            </button>
          );
        })}
      </div>
    </main>
  );
}

// ─── Subject Page ────────────────────────────────────────────────────────────
function SubjectPage({
  subjectId,
  subjects,
  topics,
  viewedIds,
  onBack,
  onSelectTopic,
}: {
  subjectId: bigint;
  subjects: Subject[];
  topics: Topic[];
  viewedIds: Set<string>;
  onBack: () => void;
  onSelectTopic: (id: bigint) => void;
}) {
  const subject = subjects.find((s) => s.id === subjectId);
  const meta = subject ? getSubjectMeta(subject.name) : getSubjectMeta("");

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <button
        type="button"
        onClick={onBack}
        className="text-slate-400 hover:text-white mb-6 flex items-center gap-2 transition-colors"
      >
        ← Back
      </button>
      <div className="flex items-center gap-4 mb-8">
        <span className="text-5xl">{meta.emoji}</span>
        <div>
          <h1 className={`text-3xl font-bold ${meta.color}`}>
            {subject?.name}
          </h1>
          <p className="text-slate-400 text-sm">{topics.length} topics</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {topics.map((t, i) => (
          <button
            type="button"
            key={String(t.id)}
            data-ocid={`subject.topic_card.${i + 1}`}
            onClick={() => onSelectTopic(t.id)}
            className={`topic-card text-left rounded-2xl p-5 border ${meta.bg} ${meta.border} hover:scale-[1.03] transition-all duration-300 stagger-in`}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className="flex items-start justify-between mb-2">
              <span className={`font-semibold ${meta.color}`}>{t.title}</span>
              {viewedIds.has(String(t.id)) && (
                <span className="text-green-400 text-xs">✓</span>
              )}
            </div>
            <Badge
              variant="outline"
              className="text-xs border-slate-600 text-slate-400"
            >
              {t.category}
            </Badge>
            <p className="text-slate-400 text-xs mt-2 line-clamp-2">
              {t.description}
            </p>
          </button>
        ))}
      </div>
    </main>
  );
}

// ─── Topic Page ───────────────────────────────────────────────────────────────
function TopicPage({
  topicId,
  subjectId,
  subjects,
  topics,
  viewedIds,
  onBack,
  onMarkViewed,
  onNavigate,
}: {
  topicId: bigint;
  subjectId: bigint;
  subjects: Subject[];
  topics: Topic[];
  viewedIds: Set<string>;
  onBack: () => void;
  onMarkViewed: (id: bigint) => void;
  onNavigate: (id: bigint) => void;
}) {
  const [topic, setTopic] = useState<Topic | null>(null);
  const { actor } = useActor();
  const api = actor as backendInterface;
  const subject = subjects.find((s) => s.id === subjectId);
  const meta = subject ? getSubjectMeta(subject.name) : getSubjectMeta("");
  // biome-ignore lint/correctness/useExhaustiveDependencies: api methods from actor
  useEffect(() => {
    api.getTopic(topicId).then((t) => {
      setTopic(t);
      onMarkViewed(topicId);
    });
  }, [topicId, onMarkViewed, actor]);

  const idx = topics.findIndex((t) => t.id === topicId);
  const prevTopic = idx > 0 ? topics[idx - 1] : null;
  const nextTopic = idx < topics.length - 1 ? topics[idx + 1] : null;

  if (!topic) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        data-ocid="topic.loading_state"
      >
        <div className="loader-ring" />
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 fade-in">
      <button
        type="button"
        onClick={onBack}
        className="text-slate-400 hover:text-white mb-6 flex items-center gap-2 transition-colors"
      >
        ← {subject?.name}
      </button>

      {/* Animation */}
      <div
        className={`rounded-3xl mb-8 overflow-hidden border ${meta.border} ${meta.bg}`}
      >
        <TopicAnimation subjectName={subject?.name ?? ""} />
      </div>

      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div>
          <Badge
            className={`mb-2 ${meta.bg} ${meta.color} border ${meta.border}`}
          >
            {topic.category}
          </Badge>
          <h1 className="text-3xl font-bold text-white">{topic.title}</h1>
        </div>
        {viewedIds.has(String(topic.id)) && (
          <Badge
            variant="secondary"
            className="bg-green-900/50 text-green-400 border border-green-700 ml-auto flex-shrink-0"
          >
            ✓ Viewed
          </Badge>
        )}
      </div>

      <p className="text-slate-300 text-base leading-relaxed mb-8">
        {topic.description}
      </p>

      {/* Key Points */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 mb-8">
        <h2 className="text-lg font-semibold text-slate-200 mb-4">
          Key Points
        </h2>
        <ul className="space-y-3">
          {topic.keyPoints.map((kp, i) => (
            <li
              key={kp}
              className="flex items-start gap-3 stagger-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span
                className={`w-6 h-6 rounded-full ${meta.bg} ${meta.color} border ${meta.border} flex items-center justify-center text-xs flex-shrink-0 mt-0.5`}
              >
                {i + 1}
              </span>
              <span className="text-slate-300 text-sm">{kp}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button
          data-ocid="topic.prev_button"
          variant="outline"
          disabled={!prevTopic}
          onClick={() => prevTopic && onNavigate(prevTopic.id)}
          className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          ← {prevTopic?.title ?? "Previous"}
        </Button>
        <Button
          data-ocid="topic.mark_viewed_button"
          onClick={() => onMarkViewed(topic.id)}
          className={`${meta.bg} ${meta.color} border ${meta.border} hover:opacity-80`}
        >
          ✓ Mark Viewed
        </Button>
        <Button
          data-ocid="topic.next_button"
          variant="outline"
          disabled={!nextTopic}
          onClick={() => nextTopic && onNavigate(nextTopic.id)}
          className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          {nextTopic?.title ?? "Next"} →
        </Button>
      </div>
    </main>
  );
}

// ─── Search Page ─────────────────────────────────────────────────────────────
function SearchPage({
  query,
  results,
  subjects,
  viewedIds,
  onSelectTopic,
}: {
  query: string;
  results: Topic[];
  subjects: Subject[];
  viewedIds: Set<string>;
  onSelectTopic: (t: Topic) => void;
}) {
  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold text-slate-200 mb-2">Search Results</h2>
      <p className="text-slate-400 mb-6">Showing results for "{query}"</p>
      {results.length === 0 ? (
        <div
          className="text-center text-slate-500 py-20"
          data-ocid="search.empty_state"
        >
          No topics found. Try a different keyword.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((t, i) => {
            const subj = subjects.find((s) => s.id === t.subjectId);
            const meta = subj ? getSubjectMeta(subj.name) : getSubjectMeta("");
            return (
              <button
                type="button"
                key={String(t.id)}
                data-ocid={`search.result_card.${i + 1}`}
                onClick={() => onSelectTopic(t)}
                className={`text-left rounded-2xl p-5 border ${meta.bg} ${meta.border} hover:scale-[1.03] transition-all stagger-in`}
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className={`font-semibold text-sm ${meta.color}`}>
                    {t.title}
                  </span>
                  {viewedIds.has(String(t.id)) && (
                    <span className="text-green-400 text-xs">✓</span>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className="text-xs border-slate-600 text-slate-400 mb-2"
                >
                  {subj?.name} · {t.category}
                </Badge>
                <p className="text-slate-400 text-xs line-clamp-2">
                  {t.description}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </main>
  );
}
