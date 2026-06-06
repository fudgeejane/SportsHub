import toast from 'react-hot-toast'

export function toastSuccess(message) {
  toast.success(message)
}

export function toastError(message) {
  toast.error(message)
}

export function toastInfo(message) {
  toast(message)
}

export async function toastPromise(promise, messages) {
  return toast.promise(promise, messages)
}
