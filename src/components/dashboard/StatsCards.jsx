import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

export default function StatsCards({ title, value, icon: Icon, gradient, progress, trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.05, y: -8 }}
      className="h-full"
    >
      <Card className={`relative h-full overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 group ${gradient} shine-effect`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="absolute top-0 right-0 w-40 h-40 transform translate-x-10 -translate-y-10 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
        <div className="absolute bottom-0 left-0 w-32 h-32 transform -translate-x-8 translate-y-8 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <CardContent className="relative z-10 p-5 sm:p-7 text-white h-full flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm sm:text-base font-semibold text-white/80 mb-2">{title}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl sm:text-4xl lg:text-5xl font-black leading-none">
                  {value}
                </p>
                {trend && (
                  <span className={`text-xs sm:text-sm font-bold ${trend > 0 ? 'text-green-200' : 'text-red-200'}`}>
                    {trend > 0 ? '+' : ''}{trend}%
                  </span>
                )}
              </div>
            </div>
            <motion.div
              whileHover={{ rotate: 360, scale: 1.2 }}
              transition={{ duration: 0.7, type: "spring" }}
              className="w-14 h-14 sm:w-16 sm:h-16 bg-white/25 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-500 neon-glow"
            >
              <Icon className="w-7 h-7 sm:w-9 sm:h-9 text-white drop-shadow-lg" />
            </motion.div>
          </div>

          {progress !== undefined && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/80 font-medium">התקדמות</span>
                <span className="font-bold">{Math.min(progress, 100).toFixed(0)}%</span>
              </div>
              <div className="relative h-3 bg-white/20 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-white to-white/80 rounded-full shadow-lg"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
