export interface Banya {
  id: number
  name: string
  type: string
  category: string
  pricePerHour: number
  capacity: number
  rating: number
  image: string
}

export interface ExtraService {
  id: string
  name: string
  price: number
}
