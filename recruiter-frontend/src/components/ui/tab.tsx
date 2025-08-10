import { motion } from 'motion/react';

import { cn } from '@/lib/utils';

import { Badge } from './badge';

interface TabProps {
  text: string;
  selected: boolean;
  setSelected: (text: string) => void;
  discount?: boolean;
}

export const Tab = ({
  text,
  selected,
  setSelected,
  discount = false,
}: TabProps) => {
  return (
    <button
      onClick={() => setSelected(text)}
      className={cn(
        'text-foreground relative w-fit px-4 py-2 text-sm font-semibold capitalize transition-colors',
        discount && 'flex items-center justify-center gap-2.5'
      )}
    >
      <span className="relative z-10">{text}</span>
      {selected && (
        <motion.span
          layoutId="tab"
          transition={{ type: 'spring', duration: 0.4 }}
          className="bg-background absolute inset-0 z-0 rounded-full shadow-sm"
        ></motion.span>
      )}
      {discount && (
        <Badge
          className={cn(
            'relative z-10 bg-gray-100 text-xs whitespace-nowrap text-black shadow-none hover:bg-gray-100',
            selected
              ? 'bg-[#F3F4F6] hover:bg-[#F3F4F6]'
              : 'bg-gray-300 hover:bg-gray-300'
          )}
        >
          Save 35%
        </Badge>
      )}
    </button>
  );
};
