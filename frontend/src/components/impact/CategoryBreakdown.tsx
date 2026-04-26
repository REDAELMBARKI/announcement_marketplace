import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { DashboardCategory } from "./types";

interface CategoryBreakdownProps {
  categories: DashboardCategory[];
}

const categoryColors: Record<string, string> = {
  Clothes: "#c2410c",
  Shoes: "#5dcaa5",
  Accessories: "#ef9f27",
};

export default function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  const total = categories.reduce((sum, item) => sum + item.count, 0);

  return (
    <section className="impact-card">
      <h3 className="impact-card__title">Category breakdown</h3>
      {total === 0 ? (
        <div className="impact-empty">
          <span className="impact-empty__icon" aria-hidden>
            <i className="fa-solid fa-basket-shopping" />
          </span>
          No categories to display yet.
        </div>
      ) : (
        <>
          <div className="impact-chart-wrap">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Tooltip />
                <Pie
                  data={categories as { category: string; count: number }[]}
                  dataKey="count"
                  nameKey="category"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={2}
                >
                  {categories.map((item) => (
                    <Cell
                      key={item.category}
                      fill={categoryColors[item.category] || "#ea580c"}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="impact-legend">
            {categories.map((item) => (
              <div key={item.category} className="impact-legend__row">
                <div className="impact-legend__left">
                  <span
                    className="impact-legend__dot"
                    style={{
                      background: categoryColors[item.category] || "#4a7c59",
                    }}
                  />
                  <span>{item.category}</span>
                </div>
                <span className="impact-legend__count">{item.count}</span>
              </div>
            ))}
            <div className="impact-legend__row" style={{ marginTop: "0.25rem", fontWeight: 600 }}>
              <span className="impact-legend__left">Total listings counted</span>
              <span className="impact-legend__count">{total}</span>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
