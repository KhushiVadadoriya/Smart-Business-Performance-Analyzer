import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { useAnalysisStore } from "../../store/analysisStore";
import { AnalysisStepper } from "./AnalysisStepper";
import { Step1DataSource } from "./Step1DataSource";
import { Step2UploadConnect } from "./Step2UploadConnect";
import { Step3ColumnSelection } from "./Step3ColumnSelection";
import { Step4DataUnderstanding } from "./Step4DataUnderstanding";
import { Step5DataQuality } from "./Step5DataQuality";
import { Step6Analysis } from "./Step6Analysis";
import { Step7Insights } from "./Step7Insights";
import { Step8FinalSummary } from "./Step8FinalSummary";

export function AnalysisPage() {
  const step = useAnalysisStore((s) => s.currentStep);
  const goNext = useAnalysisStore((s) => s.goNext);
  const goBack = useAnalysisStore((s) => s.goBack);
  const canGoNext = useAnalysisStore((s) => s.canGoToStep(((s.currentStep + 1) as unknown) as never));

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr] print:block print:gap-0">
      <div className="print:hidden">
        <AnalysisStepper />
      </div>
      <div className="min-w-0 space-y-4 print:space-y-0">
        <Card className="flex items-center justify-between gap-3 print:hidden">
          <div className="min-w-0">
            <div className="truncate text-sm font-black text-[var(--sbpa-dark)]">
              Analysis Pipeline
            </div>
            <div className="truncate text-xs text-[var(--sbpa-dark)]/55">
              Strict stepper — complete each step in order
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={goBack}
              disabled={step === 1}
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={goNext}
              disabled={step === 8 || !canGoNext}
            >
              Next
            </Button>
          </div>
        </Card>

        {step === 1 ? <Step1DataSource /> : null}
        {step === 2 ? <Step2UploadConnect /> : null}
        {step === 3 ? <Step3ColumnSelection /> : null}
        {step === 4 ? <Step4DataUnderstanding /> : null}
        {step === 5 ? <Step5DataQuality /> : null}
        {step === 6 ? <Step6Analysis /> : null}
        {step === 7 ? <Step7Insights /> : null}
        {step === 8 ? <Step8FinalSummary /> : null}
      </div>
    </div>
  );
}

