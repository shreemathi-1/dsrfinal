export default function ComplaintTrends() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Complaint Trends
      </h3>
      <div className="relative h-64">
        <svg className="w-full h-full" viewBox="0 0 400 200">
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#f0f0f0"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            points="40,160 80,140 120,130 160,120 200,100 240,90 280,80 320,70 360,60"
          />
          <polyline
            fill="none"
            stroke="#ef4444"
            strokeWidth="3"
            points="40,180 80,178 120,175 160,170 200,165 240,160 280,155 320,150 360,145"
          />
          <circle cx="40" cy="160" r="4" fill="#3b82f6" />
          <circle cx="120" cy="130" r="4" fill="#3b82f6" />
          <circle cx="200" cy="100" r="4" fill="#3b82f6" />
          <circle cx="280" cy="80" r="4" fill="#3b82f6" />
          <circle cx="360" cy="60" r="4" fill="#3b82f6" />
          <circle cx="120" cy="175" r="4" fill="#ef4444" />
          <circle cx="240" cy="160" r="4" fill="#ef4444" />
          <circle cx="360" cy="145" r="4" fill="#ef4444" />
          <text
            x="40"
            y="195"
            textAnchor="middle"
            className="text-xs fill-gray-500"
          >
            Jan
          </text>
          <text
            x="80"
            y="195"
            textAnchor="middle"
            className="text-xs fill-gray-500"
          >
            Feb
          </text>
          <text
            x="120"
            y="195"
            textAnchor="middle"
            className="text-xs fill-gray-500"
          >
            Mar
          </text>
          <text
            x="160"
            y="195"
            textAnchor="middle"
            className="text-xs fill-gray-500"
          >
            Apr
          </text>
          <text
            x="200"
            y="195"
            textAnchor="middle"
            className="text-xs fill-gray-500"
          >
            May
          </text>
          <text
            x="240"
            y="195"
            textAnchor="middle"
            className="text-xs fill-gray-500"
          >
            Jun
          </text>
          <text
            x="280"
            y="195"
            textAnchor="middle"
            className="text-xs fill-gray-500"
          >
            Jul
          </text>
          <text
            x="320"
            y="195"
            textAnchor="middle"
            className="text-xs fill-gray-500"
          >
            Aug
          </text>
          <text
            x="360"
            y="195"
            textAnchor="middle"
            className="text-xs fill-gray-500"
          >
            Sep
          </text>
          <text
            x="25"
            y="180"
            textAnchor="end"
            className="text-xs fill-gray-500"
          >
            0
          </text>
          <text
            x="25"
            y="140"
            textAnchor="end"
            className="text-xs fill-gray-500"
          >
            100
          </text>
          <text
            x="25"
            y="100"
            textAnchor="end"
            className="text-xs fill-gray-500"
          >
            200
          </text>
          <text
            x="25"
            y="60"
            textAnchor="end"
            className="text-xs fill-gray-500"
          >
            300
          </text>
        </svg>
      </div>
      <div className="flex items-center justify-center space-x-6 mt-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Total Complaints</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Closed cases</span>
        </div>
      </div>
    </div>
  );
}
