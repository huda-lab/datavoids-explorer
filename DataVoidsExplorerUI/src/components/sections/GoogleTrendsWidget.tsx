import React, { memo, useEffect, useRef, useState } from "react";

interface GoogleTrendsWidgetProps {
  keyword: string;
  startTime: string;
  endTime: string;
  geo: string;
  type: "TIMESERIES" | "GEO_MAP" | "RELATED_QUERIES" | "RELATED_TOPICS";
}

const GoogleTrendsWidget: React.FC<GoogleTrendsWidgetProps> = memo(
  ({ keyword, startTime, endTime, geo = "", type = "TIMESERIES" }) => {
    const widgetRef = useRef<HTMLDivElement>(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    // Load script
    useEffect(() => {
      if (scriptLoaded) {
        return;
      }
      const script = document.createElement("script");
      script.src =
        "https://ssl.gstatic.com/trends_nrtr/3620_RC01/embed_loader.js";
      script.addEventListener("load", () => setScriptLoaded(true));
      document.body.appendChild(script);
    }, []);

    // Render
    useEffect(() => {
      if (!widgetRef.current || !keyword || !startTime || !endTime) {
        return;
      }

      widgetRef.current.innerHTML = ""; // Delete content if this is a redraw
      window.trends.embed.renderExploreWidgetTo(
        widgetRef.current,
        type,
        {
          comparisonItem: [{ keyword, geo, time: `${startTime} ${endTime}` }],
          category: 0,
          property: "",
        },
        {
          exploreQuery:
            `date=${startTime}%20${endTime}` +
            `&geo=${geo}` +
            `&q=${encodeURIComponent(keyword)}` +
            `&hl=en`,
          guestPath: "https://trends.google.com:443/trends/embed/",
        },
      );
    }, [scriptLoaded, keyword, geo, startTime, endTime, type]);

    return scriptLoaded && <div ref={widgetRef} style={{ width: "100%" }} />;
  },
);

export default GoogleTrendsWidget;
