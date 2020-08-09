// Autobind Decorator
export function Autobind(target, methodName, descriptor) {
    const originalMethod = descriptor.value;
    const adjustedDescriptor = {
        configurable: true,
        get() {
            return originalMethod.bind(this);
        }
    };
    return adjustedDescriptor;
}
//# sourceMappingURL=autoBindDecorator.js.map