#include "Patch.h"
#include "SineOscillator.h"

class TestTonePatch : public Patch {
private:
  SineOscillator osc;
public:
  TestTonePatch() {
    osc.setSampleRate(getSampleRate());
  }
  void processAudio(AudioBuffer &buffer) {
    float freq = getParameterValue(PARAMETER_A)*2000 + 20;
    float amp = getParameterValue(PARAMETER_B);
    FloatArray left = buffer.getSamples(LEFT_CHANNEL);
    osc.setFrequency(freq);
    for(int n = 0; n<buffer.getSize(); n++)
      left[n] = osc.getNextSample()*amp;
  }
};
