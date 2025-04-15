import {
  Toast,
  ToastTitle,
  ToastDescription,
  useToast,
} from "@/components/ui/toast";
import { Divider } from "@/components/ui/divider";
import { Icon } from "@/components/ui/icon";
import { Send, AlertTriangle } from "lucide-react-native";
import { Avatar, AvatarFallbackText, AvatarImage } from "@/components/ui/avatar";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";


export enum TOAST {
  SUCCESS = 'success',
  NOTI = 'notification',
  INFO = 'info',
  ERROR = 'error',
  WARNING = 'warning'
}

export const useShowToast = () => {
  const toast = useToast();

  const showToast = (type: TOAST, message: string) => {
    toast.show({
      placement: "top",
      render: ({ id }) => {
        const toastId = `toast-${id}`;

        switch (type) {
          case TOAST.SUCCESS:
            return (
              <Toast
                nativeID={toastId}
                className="px-5 py-3 gap-4 shadow-soft-1 items-center flex-row bg-success-100"
              >
                <Icon
                  as={Send}
                  size="xl"
                  className="fill-typography-100 stroke-none"
                />
                <Divider
                  orientation="vertical"
                  className="h-[30px] bg-outline-200"
                />
                <ToastTitle size="sm">{message}</ToastTitle>
              </Toast>
            );

          case TOAST.NOTI:
            return (
              <Toast
                nativeID={toastId}
                className="p-4 gap-3 w-full sm:min-w-[386px] max-w-[386px] bg-background-0 shadow-hard-2 flex-row"
              >
                <Avatar>
                  <AvatarFallbackText>JS</AvatarFallbackText>
                  <AvatarImage
                    source={{
                      uri: "https://gluestack.github.io/public-blog-video-assets/Avatar.png",
                    }}
                  />
                </Avatar>
                <VStack className="web:flex-1">
                  <HStack className="justify-between">
                    <Heading
                      size="sm"
                      className="text-typography-950 font-semibold"
                    >
                      Jacob Steve
                    </Heading>
                    <Text size="sm" className="text-typography-500">
                      2m ago
                    </Text>
                  </HStack>
                  <Text size="sm" className="text-typography-500">
                    {message}
                  </Text>
                </VStack>
              </Toast>
            );

          case TOAST.ERROR:
            return (
              <Toast
                nativeID={toastId}
                className="px-4 py-3 gap-4 bg-red-100 border border-red-400 rounded-md flex-row items-center"
              >
                <Icon
                  as={AlertTriangle}
                  size="xl"
                  className="fill-red-500 stroke-none"
                />
                <ToastTitle size="sm" className="text-red-800">
                  {message}
                </ToastTitle>
              </Toast>
            );

          case TOAST.INFO || TOAST.WARNING:
          default:
            return (
              <Toast
                nativeID={toastId}
                className="px-5 py-3 gap-4 shadow-soft-1 items-center flex-row"
              >
                <Icon
                  as={Send}
                  size="xl"
                  className="fill-typography-100 stroke-none"
                />
                <Divider
                  orientation="vertical"
                  className="h-[30px] bg-outline-200"
                />
                <ToastTitle size="sm">{message}</ToastTitle>
              </Toast>
            );
        }
      },
    });
  };

  return showToast;
};
