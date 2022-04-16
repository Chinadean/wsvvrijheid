import {
  Avatar,
  Box,
  HStack,
  Image,
  SimpleGrid,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { FaPaintBrush, FaRegHeart } from 'react-icons/fa'
import { IoMdSettings } from 'react-icons/io'
import { MdRemoveModerator } from 'react-icons/md'
import { useQuery } from 'react-query'

import { request } from '~lib'

import { Container } from '../layout/container'
import { Hero } from '../layout/hero'

export const AuthenticatedUserProfile = ({ user }) => {
  const { locale } = useRouter()
  const { t } = useTranslation()
  // {t`read-more`}

  const { data } = useQuery({
    queryKey: ['arts', user.username],
    queryFn: () =>
      request({
        url: 'api/arts',
        locale,
        filters: {
          artist: { user: { id: { $eq: user.id } } },
        },
        populate: ['images'],
      }),
  })

  const rejected = data?.result?.filter(art => art.status === 'rejected')
  const approved = data?.result?.filter(art => art.status !== 'rejected')

  return (
    <>
      <Hero image='/images/auth-profile-bg.avif'>
        <Stack>
          <Avatar
            size='lg'
            src={`${process.env.NEXT_PUBLIC_API_URL}${user.avatar?.formats.thumbnail.url || user.avatar?.url}`}
            name={user.username}
          />
          <HStack justifyContent='center' alignItems={'center'} alignContent={'flex-end'} bg='transparent'>
            <Text color={'white'}>{user.username}</Text>
          </HStack>
        </Stack>
      </Hero>
      <Container>
        <Tabs isLazy my={4}>
          <TabList>
            <Tab fontWeight='semibold'>
              <Box as={FaPaintBrush} mr={1} /> {t`auth-profile.my-arts`}
            </Tab>
            <Tab fontWeight='semibold'>
              <Box as={MdRemoveModerator} mr={1} /> {t`auth-profile.my-rejected-arts`}
            </Tab>
            <Tab fontWeight='semibold'>
              <Box as={IoMdSettings} mr={1} /> {t`auth-profile.general-settings`}
            </Tab>
          </TabList>
          <TabPanels>
            {/* Approved arts */}
            <TabPanel px={0}>
              <SimpleGrid columns={{ base: 1, sm: 2, md: 4, lg: 6 }} gap={4}>
                {approved?.map(art => {
                  return art?.images?.map((images, index) => {
                    return <ArtCard art={art} images={images} key={index} />
                  })
                })}
              </SimpleGrid>
            </TabPanel>
            {/* rejected arts */}
            <TabPanel>
              <HStack>
                {rejected?.map(art => {
                  return art?.images?.map((images, index) => {
                    return <ArtCard art={art} images={images} key={index} />
                  })
                })}
              </HStack>
            </TabPanel>
            {/* general Settings */}
            <TabPanel>
              <Settings user={user} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </>
  )
}

export const Settings = props => {
  const { user } = props
  return (
    <Stack>
      <Text>Username: {user.username}</Text>
      <Text>Email: {user.email}</Text>
    </Stack>
  )
}

export const ArtCard = props => {
  const { art, images, index } = props
  return (
    <Stack key={index} alt='no image'>
      <Image
        h={200}
        objectFit='cover'
        src={process.env.NEXT_PUBLIC_API_URL + images.formats?.thumbnail?.url}
        alt='no image'
        rounded='md'
      />
      <HStack justify='space-between'>
        <Text isTruncated>{art.title}</Text>
        <HStack>
          <Box as={FaRegHeart} color='red'></Box>
          <Text>{art.likes}</Text>
        </HStack>
      </HStack>
    </Stack>
  )
}
