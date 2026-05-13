import { gql } from '@apollo/client/core'

export const CREATE_PET = gql`
  mutation CreatePet($createPetInput: CreatePetInput!) {
    createPet(createPetInput: $createPetInput) {
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

export const UPDATE_PET = gql`
  mutation UpdatePet($id: Int!, $updatePetInput: UpdatePetInput!) {
    updatePet(id: $id, updatePetInput: $updatePetInput) {
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

export const DELETE_PET = gql`
  mutation DeletePet($id: Int!) {
    deletePet(id: $id)
  }
`

export const ADD_PHOTO = gql`
  mutation AddPhoto($createPhotoInput: CreatePhotoInput!) {
    addPhoto(createPhotoInput: $createPhotoInput) {
      id
      url
      description
      date
      createdAt
    }
  }
`

export const ADD_GROWTH_RECORD = gql`
  mutation AddGrowthRecord($createGrowthRecordInput: CreateGrowthRecordInput!) {
    addGrowthRecord(createGrowthRecordInput: $createGrowthRecordInput) {
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
