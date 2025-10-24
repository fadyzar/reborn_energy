
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PackageOpen, Sparkles, Loader2, Gift, Lock } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


export default function Inventory({ items, onUseItem, onGiftItem, userLevel }) {
  const [usingItemId, setUsingItemId] = useState(null);

  const handleUse = async (item) => {
    setUsingItemId(item.id);
    await onUseItem(item);
    setUsingItemId(null);
  };

  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-3 text-xl font-bold">
          <PackageOpen className="text-purple-400 w-7 h-7" />
          התיק שלי
        </CardTitle>
        <CardDescription className="text-gray-400">פריטים שצברת לחיזוק האוואטר שלך</CardDescription>
      </CardHeader>
      <CardContent>
        {(!items || items.length === 0) ? (
          <div className="text-center py-8 text-gray-400">
            <PackageOpen className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <p className="font-semibold text-lg">התיק שלך ריק.</p>
            <p className="text-sm">אסוף את הפרס היומי והשלם אתגרים כדי להשיג פריטים!</p>
          </div>
        ) : (
          <TooltipProvider>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <AnimatePresence>
                {items.map(item => {
                  const requiredLevelMatch = item.blueprint.name.match(/\[רמה (\d+)\]/);
                  const requiredLevel = requiredLevelMatch ? parseInt(requiredLevelMatch[1], 10) : 0;
                  const isLocked = requiredLevel > 0 && userLevel < requiredLevel;

                  return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className={`bg-gray-900/70 border-purple-500/30 overflow-hidden text-center h-full flex flex-col justify-between transform hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-purple-500/40 ${isLocked ? 'filter grayscale brightness-75' : ''}`}>
                      <div className="p-3">
                        <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center rounded-lg bg-purple-500/10">
                            {isLocked ? 
                                <Lock className="w-7 h-7 text-gray-500" /> : 
                                <Sparkles className="w-7 h-7 text-purple-400 drop-shadow-[0_0_5px_rgba(192,132,252,0.5)]" />
                            }
                        </div>
                        <h4 className="font-semibold text-xs text-purple-300 truncate">{item.blueprint.name}</h4>
                        <p className="text-xs text-gray-400 mt-1 min-h-[30px]">{item.blueprint.description}</p>
                      </div>
                      <div className="p-1.5 bg-black/40 flex items-center justify-center gap-1.5">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    size="icon" 
                                    variant="outline"
                                    className="h-8 w-8 bg-transparent border-teal-500/50 text-teal-300 hover:bg-teal-500/20 hover:text-teal-200"
                                    onClick={() => onGiftItem(item)}
                                >
                                    <Gift className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-gray-800 text-white border-purple-500">
                                <p>שלח מתנה (בקרוב)</p>
                            </TooltipContent>
                        </Tooltip>
                        {isLocked ? (
                            <Button size="sm" className="h-8 flex-1 bg-gray-700/50 border-gray-600 text-gray-400 text-xs" disabled>
                                <Lock className="w-3 h-3 mr-1.5" />
                                רמה {requiredLevel}
                            </Button>
                        ) : (
                         <Button 
                           size="sm" 
                           className="h-8 flex-1 bg-purple-600 hover:bg-purple-700 relative text-xs"
                           onClick={() => handleUse(item)}
                           disabled={usingItemId === item.id}
                         >
                           {usingItemId === item.id ? (
                             <Loader2 className="w-4 h-4 animate-spin" />
                           ) : (
                             <>
                               <Sparkles className="w-3 h-3 mr-1 sm:mr-2" />
                               <span>שימוש</span>
                             </>
                           )}
                           {item.quantity > 1 && (
                             <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{item.quantity}</span>
                           )}
                         </Button>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                )})}
              </AnimatePresence>
            </div>
          </TooltipProvider>
        )}
      </CardContent>
    </>
  );
}
