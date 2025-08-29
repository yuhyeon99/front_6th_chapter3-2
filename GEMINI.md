# GEMINI Guidelines – TDD

## Test-Driven Development (TDD)

This project adopts **TDD (Test-Driven Development)** as a core principle.
Developers must follow the **Red → Green → Refactor** cycle iteratively to build features incrementally.

---

### TDD Cycle Rules

1. **Red (Write a failing test)**

   * Always write the test **before** implementation.
   * Define the smallest possible unit test that validates the intended behavior.
   * Tests must fail at this stage because no implementation exists yet.

2. **Green (Write code to pass the test)**

   * Write the **minimum amount of code** required to make the test pass.
   * Avoid over-engineering or adding unnecessary features.

3. **Refactor (Improve the code)**

   * Remove duplication, improve readability, add meaningful names, and refactor responsibilities.
   * After every refactor, ensure that all tests remain **GREEN**.

---

### Test Writing Principles

* **Specification-driven**

  * Define the functional requirements of a component/module first.
  * Convert requirements into testable scenarios.

* **Unit-test focused**

  * Each function, class, or component should be tested in isolation.
  * External dependencies (APIs, DB, etc.) must be **mocked**.

* **Small incremental cycles**

  * Never build large features at once.
  * Repeat test–implementation–refactor in small steps.

---

### Example Rules

#### 1. Module Function (e.g., `isAdult`)

* **Red**

  ```ts
  test('returns true if age >= 18', () => {
    expect(isAdult(18)).toBe(true);
  });
  ```

* **Green**

  ```ts
  export const isAdult = (age: number) => age >= 18;
  ```

* **Refactor**

  ```ts
  export const isAdult = (age: number) => {
    const isInvalid = typeof age !== 'number' || age < 0;
    if (isInvalid) throw new Error('Invalid age');
    return age >= 18;
  };
  ```

#### 2. React Component (e.g., `TextField`)

* **Red**

  ```tsx
  it('renders default placeholder "Enter text"', () => {
    render(<TextField />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });
  ```

* **Green**

  ```tsx
  export default function TextField() {
    return <input type="text" placeholder="Enter text" />;
  }
  ```

* **Refactor**

  ```tsx
  export default function TextField({ placeholder = "Enter text", onChange }) {
    const [value, setValue] = useState("");
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      onChange?.(e.target.value);
    };
    return <input type="text" placeholder={placeholder} value={value} onChange={handleChange} />;
  }
  ```

---

### Notes

* All new features **must** be implemented following the TDD cycle.
* Test coverage is not just for numbers but for validating real specifications.
* Tests serve as **living documentation**, so they must be clear and descriptive.
