import AppLayout from '../components/AppLayout';
import { motion } from 'framer-motion';
import MotionCard from '../components/MotionCard';
import Typography from '@mui/material/Typography';
import '../styles/Dashboard.css';
import { staggerContainer } from '../utils/animations';
import WbTwilightIcon from '@mui/icons-material/WbTwilight';
import AirIcon from '@mui/icons-material/Air';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import SyncIcon from '@mui/icons-material/Sync';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import PestControlIcon from '@mui/icons-material/PestControl';
import BlockIcon from '@mui/icons-material/Block';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ScienceIcon from '@mui/icons-material/Science';
import MenuBookIcon from '@mui/icons-material/MenuBook';

export const CareTips = () => {
  const tips = [
    {
      icon: <WbTwilightIcon fontSize="inherit" />,
      title: 'Watering Time',
      description: 'Water your plants during early morning hours for best results. This allows plants to absorb water before the heat of the day.',
      details: 'Early morning watering prevents water loss through evaporation and ensures plants have hydration throughout the day.'
    },
    {
      icon: <AirIcon fontSize="inherit" />,
      title: 'Drainage',
      description: 'Ensure proper drainage to prevent root rot and fungal issues. Use pots with drainage holes.',
      details: 'Proper drainage prevents water accumulation, which is one of the most common causes of plant death.'
    },
    {
      icon: <DeviceThermostatIcon fontSize="inherit" />,
      title: 'Soil Check',
      description: 'Check soil moisture before watering by touching the top layer. Water only when soil is dry.',
      details: 'This simple test prevents overwatering, the most common plant care mistake.'
    },
    {
      icon: <WbSunnyIcon fontSize="inherit" />,
      title: 'Light Exposure',
      description: 'Keep plants away from direct heat sources and ensure adequate light.',
      details: 'Different plants need different light levels. Research your plant\'s specific light requirements.'
    },
    {
      icon: <WaterDropIcon fontSize="inherit" />,
      title: 'Humidity Levels',
      description: 'Maintain appropriate humidity levels based on plant type. Use a humidifier for tropical plants.',
      details: 'Most houseplants prefer humidity levels between 40-50%. Group plants together to increase humidity naturally.'
    },
    {
      icon: <SyncIcon fontSize="inherit" />,
      title: 'Seasonal Rotation',
      description: 'Rotate your plants every few weeks to ensure even light exposure on all sides.',
      details: 'This prevents plants from becoming leggy and ensures symmetrical, healthy growth.'
    },
    {
      icon: <ContentCutIcon fontSize="inherit" />,
      title: 'Pruning & Trimming',
      description: 'Remove dead leaves and stems regularly to encourage new growth.',
      details: 'Pruning improves air circulation and removes diseased or damaged plant material.'
    },
    {
      icon: <PestControlIcon fontSize="inherit" />,
      title: 'Pest Management',
      description: 'Inspect plants regularly for pests and treat infestations early.',
      details: 'Common indoor plant pests include spider mites, scale, and mealybugs. Neem oil is an effective organic treatment.'
    },
  ];

  return (
    <AppLayout activeMenu="tips" pageTitle="Plant Care Tips">
      <div className="section">
        <Typography variant="h5" component="h2" sx={{ margin: 0, fontWeight: 700, color: '#333' }}>Essential Plant Care Guide</Typography>
        <motion.div className="tips-grid" variants={staggerContainer} initial="initial" animate="animate">
          {tips.map((tip, index) => (
            <MotionCard key={index} className="tip-card">
              <div className="tip-icon">{tip.icon}</div>
              <Typography variant="h6" component="h3" sx={{ margin: '12px 0 8px 0', fontWeight: 700, color: '#333' }}>{tip.title}</Typography>
              <Typography variant="body2" sx={{ color: '#666', margin: '0 0 12px 0', lineHeight: 1.6 }}>{tip.description}</Typography>
              <Typography variant="caption" sx={{ color: '#999', margin: 0, lineHeight: 1.6, background: '#f9f9f9', padding: '12px', borderRadius: '8px', display: 'block' }}>{tip.details}</Typography>
            </MotionCard>
          ))}
        </motion.div>
      </div>

      <div className="section" style={{ marginTop: '40px' }}>
        <Typography variant="h5" component="h2" sx={{ margin: 0, fontWeight: 700, color: '#333' }}>Quick Tips</Typography>
        <motion.div className="quick-tips" variants={staggerContainer} initial="initial" animate="animate">
          {[
            { icon: <BlockIcon fontSize="inherit" />, label: "Don't Overwater", text: 'Most plant problems stem from overwatering. Let soil dry between waterings.' },
            { icon: <LocationOnIcon fontSize="inherit" />, label: 'Location Matters', text: 'Place plants near windows for natural light, but avoid direct harsh sunlight on sensitive plants.' },
            { icon: <ScienceIcon fontSize="inherit" />, label: 'Know Your Soil', text: 'Use well-draining potting soil appropriate for your plant type (cacti, tropical, etc.).' },
            { icon: <DeviceThermostatIcon fontSize="inherit" />, label: 'Temperature Control', text: 'Keep plants away from heating vents, air conditioners, and cold drafts.' },
            { icon: <AirIcon fontSize="inherit" />, label: 'Smell Test', text: 'If soil smells bad, it indicates root rot. Repot the plant immediately with fresh soil.' },
            { icon: <MenuBookIcon fontSize="inherit" />, label: 'Research', text: 'Each plant species has unique care requirements. Research before bringing a new plant home.' },
          ].map((item, i) => (
            <MotionCard key={i} className="quick-tip-item">
              <strong>{item.icon} {item.label}:</strong> {item.text}
            </MotionCard>
          ))}
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default CareTips;
