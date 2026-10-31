import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Cpu, Mountain } from 'lucide-react';

const features = [
  {
    icon: Layers,
    title: 'Couche par couche',
    description: 'Chaque objet naît d\'un processus de fabrication additive, déposant des couches de matière avec une précision micrométrique.',
  },
  {
    icon: Cpu,
    title: 'Technologie FDM',
    description: 'Des imprimantes de pointe pour offrir le meilleur rendu en filament, avec une précision couche par couche.',
  },
  {
    icon: Mountain,
    title: 'Made in Vallée de Joux',
    description: 'Un savoir-faire local ancré dans les montagnes suisses — chaque pièce porte l\'âme de ce territoire.',
  },
];

export default function AboutSection() {
  return (
    <section className="relative py-32 px-6 md:px-[8vw]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <p className="font-mono text-xs tracking-[0.3em] text-primary mb-4 uppercase">
            À propos
          </p>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl tracking-tight mb-6">
            L'impression 3D
            <br />
            <span className="text-muted-foreground">réinventée.</span>
          </h2>
          <p className="font-body text-muted-foreground text-base md:text-lg max-w-xl leading-relaxed">
            Je suis Joël, passionné de fabrication numérique. Depuis la Vallée de Joux, 
            je crée des objets uniques grâce à l'impression 3D — du concept au produit fini.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="group p-8 border border-border/50 bg-card/30 backdrop-blur-sm hover:border-primary/30 transition-all duration-500"
            >
              <feature.icon className="w-6 h-6 text-primary mb-6" strokeWidth={1.5} />
              <h3 className="font-display font-bold text-lg mb-3">{feature.title}</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Decorative line */}
      <div className="absolute bottom-0 left-[8vw] right-[8vw] h-px bg-border/50" />
    </section>
  );
}