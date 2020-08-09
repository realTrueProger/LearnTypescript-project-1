namespace App {
    // Autobind Decorator
    export function Autobind(target: any, methodName: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        const adjustedDescriptor: PropertyDescriptor = {
            configurable: true,
            get() {
                return originalMethod.bind(this);
            }
        };

        return adjustedDescriptor;
    }
}