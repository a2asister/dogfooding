import { gql } from '@apollo/client/core'

export const GET_PETS = gql`
  query GetPets {
    pets {
      id
      name
      species
      breed
      birthday
      avatar
      gender
      weight
      createdAt
    }
  }
`

export const GET_PET = gql`
  query GetPet($id: Int!) {
    pet(id: $id) {
      id
      name
      species
      breed
      birthday
      avatar
      gender
      weight
      photos {
        id
        url
        description
        date
        createdAt
      }
      growthRecords {
        id
        date
        weight
        height
        note
        milestone
        createdAt
      }
      createdAt
    }
  }
`

export const GET_PET_PHOTOS = gql`
  query GetPetPhotos($petId: Int!) {
    petPhotos(petId: $petId) {
      id
      url
      description
      date
      createdAt
    }
  }
`

export const GET_GROWTH_RECORDS = gql`
  query GetGrowthRecords($petId: Int!) {
    growthRecords(petId: $petId) {
      id
      date
      weight
      height
      note
      milestone
      createdAt
    }
  }
`
