import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Bar } from "recharts";

interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface CandlestickChartProps {
  data: CandleData[];
}

const CandlestickBar = (props: any) => {
  const { payload, x, y, width, height } = props;
  
  if (!payload) return null;
  
  const { open, high, low, close } = payload;
  const isGreen = close > open;
  const color = isGreen ? 'hsl(var(--success))' : 'hsl(var(--destructive))';
  
  // Calculate positions
  const centerX = x + width / 2;
  const bodyTop = Math.max(open, close);
  const bodyBottom = Math.min(open, close);
  const bodyHeight = Math.abs(close - open) || 1;
  
  // Scale based on chart dimensions
  const scale = height / (high - low || 1);
  const wickTop = y + (high - Math.max(open, close, high)) * scale;
  const wickBottom = y + height - (Math.min(open, close, low) - low) * scale;
  const bodyY = y + (high - bodyTop) * scale;
  
  return (
    <g>
      {/* High-Low wick */}
      <line
        x1={centerX}
        y1={wickTop}
        x2={centerX}
        y2={wickBottom}
        stroke={color}
        strokeWidth={1}
      />
      {/* Open-Close body */}
      <rect
        x={centerX - width * 0.3}
        y={bodyY}
        width={width * 0.6}
        height={bodyHeight * scale || 2}
        fill={color}
        stroke={color}
        strokeWidth={1}
      />
    </g>
  );
};

const CandlestickChart = ({ data }: CandlestickChartProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={data}
        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
      >
        <XAxis
          dataKey="time"
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={['dataMin - 2', 'dataMax + 2']}
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
          width={50}
        />
        <Bar
          dataKey="high"
          fill="transparent"
          shape={<CandlestickBar />}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default CandlestickChart;