import { render, screen, fireEvent } from "@testing-library/react";
import { useForm, FormProvider } from "react-hook-form";
import { DynamicForm } from "@/components/builder/form/DynamicForm";
import { FieldDef } from "@/lib/templates/types";

// Mock SignaturePad since it requires canvas
jest.mock("@/components/builder/form/SignaturePad", () => ({
  SignaturePad: ({
    label,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
  }) => (
    <div data-testid={`signature-${label}`}>
      <span>{label}</span>
      <button onClick={() => onChange("mock-signature-data")}>Sign</button>
    </div>
  ),
}));

// Mock react-signature-canvas
jest.mock("react-signature-canvas", () => {
  return function MockSignatureCanvas() {
    return <canvas data-testid="mock-canvas" />;
  };
});

const textFields: FieldDef[] = [
  {
    key: "name",
    label: "Full Name",
    type: "text",
    placeholder: "Enter your name",
    group: "Personal Info",
  },
  {
    key: "email",
    label: "Email Address",
    type: "text",
    placeholder: "you@example.com",
    group: "Personal Info",
  },
];

const mixedFields: FieldDef[] = [
  {
    key: "purpose",
    label: "Purpose",
    type: "textarea",
    placeholder: "Describe the purpose...",
    group: "Details",
  },
  {
    key: "startDate",
    label: "Start Date",
    type: "date",
    group: "Details",
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
];

function FormWrapper({
  fields,
  defaultValues = {},
}: {
  fields: FieldDef[];
  defaultValues?: Record<string, unknown>;
}) {
  const methods = useForm({ defaultValues });
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

describe("DynamicForm", () => {
  describe("field rendering", () => {
    it("renders text input fields with labels", () => {
      render(<FormWrapper fields={textFields} />);
      expect(screen.getByText("Full Name")).toBeDefined();
      expect(screen.getByText("Email Address")).toBeDefined();
    });

    it("renders text input placeholders", () => {
      render(<FormWrapper fields={textFields} />);
      expect(screen.getByPlaceholderText("Enter your name")).toBeDefined();
      expect(screen.getByPlaceholderText("you@example.com")).toBeDefined();
    });

    it("renders textarea fields", () => {
      render(<FormWrapper fields={mixedFields} />);
      expect(
        screen.getByPlaceholderText("Describe the purpose...")
      ).toBeDefined();
      const textarea = screen.getByPlaceholderText("Describe the purpose...");
      expect(textarea.tagName).toBe("TEXTAREA");
    });

    it("renders date input fields", () => {
      render(<FormWrapper fields={mixedFields} />);
      expect(screen.getByText("Start Date")).toBeDefined();
      const dateInput = document.querySelector('input[type="date"]');
      expect(dateInput).toBeTruthy();
    });

    it("renders radio buttons with options", () => {
      render(<FormWrapper fields={mixedFields} />);
      expect(screen.getByText("Term Type")).toBeDefined();
      expect(screen.getByText("Fixed")).toBeDefined();
      expect(screen.getByText("Indefinite")).toBeDefined();
      const radios = document.querySelectorAll('input[type="radio"]');
      expect(radios).toHaveLength(2);
    });
  });

  describe("field grouping", () => {
    it("renders group headings", () => {
      render(<FormWrapper fields={textFields} />);
      expect(screen.getByText("Personal Info")).toBeDefined();
    });

    it("renders multiple groups", () => {
      render(<FormWrapper fields={mixedFields} />);
      expect(screen.getByText("Details")).toBeDefined();
      expect(screen.getByText("Terms")).toBeDefined();
    });

    it("groups fields under the same heading together", () => {
      render(<FormWrapper fields={textFields} />);
      // Both fields should be under "Personal Info" - only one heading
      const headings = screen.getAllByText("Personal Info");
      expect(headings).toHaveLength(1);
    });
  });

  describe("user interaction", () => {
    it("allows typing in text fields", () => {
      render(
        <FormWrapper
          fields={textFields}
          defaultValues={{ name: "", email: "" }}
        />
      );
      const nameInput = screen.getByPlaceholderText(
        "Enter your name"
      ) as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: "John Doe" } });
      expect(nameInput.value).toBe("John Doe");
    });

    it("allows typing in textarea fields", () => {
      render(
        <FormWrapper fields={mixedFields} defaultValues={{ purpose: "" }} />
      );
      const textarea = screen.getByPlaceholderText(
        "Describe the purpose..."
      ) as HTMLTextAreaElement;
      fireEvent.change(textarea, {
        target: { value: "Evaluate partnership opportunity" },
      });
      expect(textarea.value).toBe("Evaluate partnership opportunity");
    });

    it("allows selecting radio options", () => {
      render(
        <FormWrapper
          fields={mixedFields}
          defaultValues={{ termType: "fixed" }}
        />
      );
      const radios = document.querySelectorAll(
        'input[type="radio"]'
      ) as NodeListOf<HTMLInputElement>;
      fireEvent.click(radios[1]); // Click "Indefinite"
      expect(radios[1].checked).toBe(true);
    });
  });

  describe("party fields", () => {
    const partyFields: FieldDef[] = [
      { key: "party1", label: "Party 1", type: "party", group: "Parties" },
    ];

    it("renders party fieldset with sub-fields", () => {
      render(
        <FormWrapper
          fields={partyFields}
          defaultValues={{
            party1: {
              name: "",
              title: "",
              company: "",
              address: "",
              signature: "",
            },
          }}
        />
      );
      expect(screen.getByText("Party 1")).toBeDefined();
      expect(screen.getByPlaceholderText("John Smith")).toBeDefined();
      expect(screen.getByPlaceholderText("CEO")).toBeDefined();
      expect(screen.getByPlaceholderText("Acme Corp")).toBeDefined();
      expect(
        screen.getByPlaceholderText("email@company.com or postal address")
      ).toBeDefined();
    });
  });
});
