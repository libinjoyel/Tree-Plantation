import { motion } from 'framer-motion';
import { fadeInUp } from '../utils/animations';

export const MotionCard = ({ children, className, ...props }) => (
  <motion.div
    variants={fadeInUp}
    initial="initial"
    animate="animate"
    whileHover={{ y: -4 }}
    transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
    className={className}
    style={{ willChange: 'transform' }}
    {...props}
  >
    {children}
  </motion.div>
);

export default MotionCard;
