import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { DynamicForm } from "@/components/builder/form/DynamicForm";
import { AppShell } from "@/components/layout/AppShell";
import { AuthProvider } from "@/contexts/AuthContext";
import { FieldDef } from "@/lib/templates/types";

// Mock Next.js Link
jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

// Mock SignaturePad
jest.mock("@/components/builder/form/SignaturePad", () => ({
  SignaturePad: ({ label }: { label: string }) => (
    <div data-testid={`signature-${label}`}>
      <span>{label}</span>
    </div>
  ),
}));

jest.mock("react-signature-canvas", () => {
  return function MockSignatureCanvas() {
    return <canvas data-testid="mock-canvas" />;
  };
});

const testFields: FieldDef[] = [
  {
    key: "name",
    label: "Full Name",
    type: "text",
    placeholder: "Enter name",
    group: "Personal",
  },
  {
    key: "notes",
    label: "Notes",
    type: "textarea",
    placeholder: "Enter notes",
    group: "Personal",
  },
  {
    key: "startDate",
    label: "Start Date",
    type: "date",
    group: "Dates",
  },
  {
    key: "termType",
    label: "Term Type",
    type: "radio",
    options: [
      { label: "Fixed", value: "fixed" },
      { label: "Indefinite", value: "indefinite" },
    ],
    group: "Terms",
  },
  {
    key: "party1",
    label: "Party 1",
    type: "party",
    group: "Parties",
  },
];

function FormWrapper({ fields }: { fields: FieldDef[] }) {
  const methods = useForm({
    defaultValues: {
      name: "",
      notes: "",
      startDate: "",
      termType: "fixed",
      party1: { name: "", title: "", company: "", address: "", signature: "" },
    },
  });
  return (
    <DynamicForm
      fields={fields}
      register={methods.register}
      setValue={methods.setValue}
      watch={methods.watch}
      errors={methods.formState.errors}
    />
  );
}

describe("Accessibility", () => {
  describe("Form labels and inputs association", () => {
    it("text inputs have associated labels via htmlFor/id", () => {
      render(<FormWrapper fields={testFields} />);
      const input = document.getElementById("field-name") as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input.tagName).toBe("INPUT");
      const label = document.querySelector('label[for="field-name"]');
      expect(label).toBeTruthy();
      expect(label?.textContent).toBe("Full Name");
    });

    it("textarea inputs have associated labels via htmlFor/id", () => {
      render(<FormWrapper fields={testFields} />);
      const textarea = document.getElementById(
        "field-notes"
      ) as HTMLTextAreaElement;
      expect(textarea).toBeTruthy();
      expect(textarea.tagName).toBe("TEXTAREA");
      const label = document.querySelector('label[for="field-notes"]');
      expect(label).toBeTruthy();
      expect(label?.textContent).toBe("Notes");
    });

    it("date inputs have associated labels via htmlFor/id", () => {
      render(<FormWrapper fields={testFields} />);
      const dateInput = document.getElementById(
        "field-startDate"
      ) as HTMLInputElement;
      expect(dateInput).toBeTruthy();
      expect(dateInput.type).toBe("date");
      const label = document.querySelector('label[for="field-startDate"]');
      expect(label).toBeTruthy();
    });

    it("party name inputs have associated labels", () => {
      render(<FormWrapper fields={testFields} />);
      const input = document.getElementById(
        "party1-name"
      ) as HTMLInputElement;
      expect(input).toBeTruthy();
      const label = document.querySelector('label[for="party1-name"]');
      expect(label).toBeTruthy();
      expect(label?.textContent).toBe("Full Name");
    });

    it("party title inputs have associated labels", () => {
      render(<FormWrapper fields={testFields} />);
      const input = document.getElementById(
        "party1-title"
      ) as HTMLInputElement;
      expect(input).toBeTruthy();
      const label = document.querySelector('label[for="party1-title"]');
      expect(label).toBeTruthy();
    });

    it("party company inputs have associated labels", () => {
      render(<FormWrapper fields={testFields} />);
      const input = document.getElementById(
        "party1-company"
      ) as HTMLInputElement;
      expect(input).toBeTruthy();
      const label = document.querySelector('label[for="party1-company"]');
      expect(label).toBeTruthy();
    });

    it("party address inputs have associated labels", () => {
      render(<FormWrapper fields={testFields} />);
      const input = document.getElementById(
        "party1-address"
      ) as HTMLInputElement;
      expect(input).toBeTruthy();
      const label = document.querySelector('label[for="party1-address"]');
      expect(label).toBeTruthy();
    });
  });

  describe("ARIA attributes", () => {
    it("radio groups use fieldset and legend", () => {
      render(<FormWrapper fields={testFields} />);
      const fieldsets = document.querySelectorAll("fieldset");
      // One for radio group "Term Type" and one for party1
      expect(fieldsets.length).toBeGreaterThanOrEqual(2);

      const legends = document.querySelectorAll("legend");
      expect(legends.length).toBeGreaterThanOrEqual(2);
    });

    it("radio groups have radiogroup role", () => {
      render(<FormWrapper fields={testFields} />);
      const radiogroup = document.querySelector('[role="radiogroup"]');
      expect(radiogroup).toBeTruthy();
    });

    it("form has aria-label", () => {
      render(<FormWrapper fields={testFields} />);
      const form = document.querySelector('[role="form"]');
      expect(form).toBeTruthy();
      expect(form?.getAttribute("aria-label")).toBe("Agreement form");
    });

    it("sections have aria-labels matching group names", () => {
      render(<FormWrapper fields={testFields} />);
      const sections = document.querySelectorAll("section[aria-label]");
      const labels = Array.from(sections).map((s) =>
        s.getAttribute("aria-label")
      );
      expect(labels).toContain("Personal");
      expect(labels).toContain("Dates");
      expect(labels).toContain("Terms");
      expect(labels).toContain("Parties");
    });
  });

  describe("AppShell navigation", () => {
    it("has a header element for navigation landmark", () => {
      render(
        <AuthProvider>
          <AppShell>
            <div>Content</div>
          </AppShell>
        </AuthProvider>
      );
      expect(document.querySelector("header")).toBeTruthy();
    });

    it("has a main element for content landmark", () => {
      render(
        <AuthProvider>
          <AppShell>
            <div>Content</div>
          </AppShell>
        </AuthProvider>
      );
      expect(document.querySelector("main")).toBeTruthy();
    });

    it("has a nav element for navigation", () => {
      render(
        <AuthProvider>
          <AppShell>
            <div>Content</div>
          </AppShell>
        </AuthProvider>
      );
      expect(document.querySelector("nav")).toBeTruthy();
    });
  });
});
