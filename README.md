# HVF-Trainer

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.XXXXX.svg)](https://doi.org/10.5281/zenodo.XXXXX)

**Web-Based Real-Time Visual Field Fixation Simulator**

HVF-Trainer is a browser-based training tool that teaches glaucoma patients the
core skill a real Humphrey Field Analyzer (HFA) exam demands: holding steady
central fixation while reporting peripheral stimuli detected only in side
vision. It uses real-time, webcam-based gaze tracking (via
[WebGazer.js](https://webgazer.cs.brown.edu/) and MediaPipe FaceMesh) to give
patients live feedback the moment their eyes drift off center, alongside a
simulated 24-2 / 10-2 perimetry test with clinically-modeled catch trials
(blind-spot, false-positive, false-negative).

Live app: **https://hvf-trainer.vercel.app**

> HVF-Trainer is an educational fixation-training simulation. It is **not** a
> medical device and does not diagnose or measure a patient's visual field.
> Always follow an eye doctor's guidance for clinical testing.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

### Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Citation

If you use this software in your clinical work or research, please cite it.
Machine-readable citation metadata is provided in
[`CITATION.cff`](./CITATION.cff) (Citation File Format v1.2.0) — GitHub
renders a "Cite this repository" button from it automatically, and it's
also picked up directly by Zenodo when this repository is archived there.

```bibtex
@software{mustafa_hvf_trainer,
  author  = {Mustafa, Norasyikin},
  title   = {{HVF-Trainer: Web-Based Real-Time Visual Field Fixation Simulator}},
  year    = {2026},
  version = {1.0.1},
  url     = {https://github.com/norasyikin-cloud/hvf-trainer},
  doi     = {10.5281/zenodo.XXXXX}
}
```

## License & Copyright

© 2026 Norasyikin Mustafa. All Rights Reserved.
