'use client';
// chakra imports
import {
  Badge,
  Box,
  Button,
  Flex,
  Icon,
  Link,
  Menu,
  MenuButton,
  MenuList,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import NavLink from '@/components/link/NavLink';
//   Custom components
import { NextAvatar } from '@/components/image/Avatar';
import Brand from '@/components/sidebar/components/Brand';
import Links from '@/components/sidebar/components/Links';
import ChatHistory from '@/components/sidebar/components/ChatHistory';
import { HSeparator } from '@/components/separator/Separator';
import { RoundedChart } from '@/components/icons/Icons';
import { PropsWithChildren } from 'react';
import { IRoute } from '@/types/navigation';
import { IoMdPerson, IoMdAdd } from 'react-icons/io';
import { FiLogOut } from 'react-icons/fi';
import { LuHistory } from 'react-icons/lu';
import { MdOutlineManageAccounts, MdOutlineSettings } from 'react-icons/md';
import { useAuth } from '@/contexts/AuthContext';
import { useChatContext } from '@/contexts/ChatContext';

// FUNCTIONS

interface SidebarContent extends PropsWithChildren {
  routes: IRoute[];
  [x: string]: any;
}

function SidebarContent(props: SidebarContent) {
  const { routes } = props;
  const { user, logout } = useAuth();
  const { createNewChat } = useChatContext();
  const toast = useToast();

  const textColor = useColorModeValue('navy.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.300');
  const bgColor = useColorModeValue('white', 'navy.700');
  const shadow = useColorModeValue(
    '14px 17px 40px 4px rgba(112, 144, 176, 0.18)',
    '14px 17px 40px 4px rgba(12, 44, 55, 0.18)',
  );
  const iconColor = useColorModeValue('navy.700', 'white');
  const shadowPillBar = useColorModeValue(
    '4px 17px 40px 4px rgba(112, 144, 176, 0.08)',
    'none',
  );
  const gray = useColorModeValue('gray.500', 'white');

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Signed out successfully',
        description: 'You have been signed out of your account.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error signing out',
        description: 'An error occurred while signing out.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleNewChat = async () => {
    try {
      await createNewChat();
    } catch (error) {
      toast({
        title: 'Error creating chat',
        description: 'Failed to create a new chat.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Get user display name and photo
  const getUserDisplayName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    const words = name.split(' ');
    if (words.length >= 2) {
      return words[0][0] + words[1][0];
    }
    return name.substring(0, 2);
  };

  // SIDEBAR
  return (
    <Flex
      direction="column"
      height="100%"
      pt="20px"
      pb="26px"
      borderRadius="30px"
      maxW="285px"
      px="20px"
    >
      <Brand />
      <Stack direction="column" mb="auto" mt="8px">
        <Box ps="0px" pe={{ md: '0px', '2xl': '0px' }}>
          <Links routes={routes} />
        </Box>

        {/* Chat History Section */}
        <Box mt="20px">
          <HSeparator mb="20px" />
          <Flex align="center" justify="space-between" mb="16px" px="10px">
            <Flex align="center">
              <Icon as={LuHistory} color={iconColor} me="8px" />
              <Text color={textColor} fontSize="sm" fontWeight="600">
                Chat History
              </Text>
            </Flex>
            <Button
              variant="ghost"
              size="xs"
              onClick={handleNewChat}
              color={iconColor}
              _hover={{ bg: 'whiteAlpha.200' }}
              px="8px"
              py="4px"
              minW="unset"
              h="auto"
              title="New Chat"
            >
              <Icon as={IoMdAdd} width="16px" height="16px" />
            </Button>
          </Flex>
          <ChatHistory />
        </Box>
      </Stack>

      <Flex
        mt="8px"
        justifyContent="center"
        alignItems="center"
        boxShadow={shadowPillBar}
        borderRadius="30px"
        p="14px"
      >
        {user?.photoURL ? (
          <NextAvatar h="34px" w="34px" src={user.photoURL} me="10px" />
        ) : (
          <Flex
            h="34px"
            w="34px"
            borderRadius="full"
            bg="brand.500"
            color="white"
            align="center"
            justify="center"
            me="10px"
            fontSize="sm"
            fontWeight="bold"
          >
            {getUserInitials().toUpperCase()}
          </Flex>
        )}
        <Text color={textColor} fontSize="xs" fontWeight="600" me="10px">
          {getUserDisplayName()}
        </Text>
        <Menu>
          <MenuButton
            as={Button}
            variant="transparent"
            aria-label=""
            border="1px solid"
            borderColor={borderColor}
            borderRadius="full"
            w="34px"
            h="34px"
            px="0px"
            p="0px"
            minW="34px"
            me="10px"
            justifyContent={'center'}
            alignItems="center"
            color={iconColor}
          >
            <Flex align="center" justifyContent="center">
              <Icon
                as={MdOutlineSettings}
                width="18px"
                height="18px"
                color="inherit"
              />
            </Flex>
          </MenuButton>
          <MenuList
            ms="-20px"
            py="25px"
            ps="20px"
            pe="20px"
            w="246px"
            borderRadius="16px"
            transform="translate(-19px, -62px)!important"
            border="0px"
            boxShadow={shadow}
            bg={bgColor}
          >
            <Box mb="30px">
              <Flex align="center" w="100%" cursor={'not-allowed'}>
                <Icon
                  as={MdOutlineManageAccounts}
                  width="24px"
                  height="24px"
                  color={gray}
                  me="12px"
                  opacity={'0.4'}
                />
                <Text
                  color={gray}
                  fontWeight="500"
                  fontSize="sm"
                  opacity={'0.4'}
                >
                  Profile Settings
                </Text>
                <Link ms="auto" isExternal href="">
                  <Badge
                    display={{ base: 'flex', lg: 'none', xl: 'flex' }}
                    colorScheme="brand"
                    borderRadius="25px"
                    color="brand.500"
                    textTransform={'none'}
                    letterSpacing="0px"
                    px="8px"
                  >
                    PRO
                  </Badge>
                </Link>
              </Flex>
            </Box>
            <Box>
              <Flex cursor={'not-allowed'} align="center">
                <Icon
                  as={IoMdPerson}
                  width="24px"
                  height="24px"
                  color={gray}
                  opacity="0.4"
                  me="12px"
                />
                <Text color={gray} fontWeight="500" fontSize="sm" opacity="0.4">
                  My Plan
                </Text>
                <Link ms="auto" isExternal href="">
                  <Badge
                    display={{ base: 'flex', lg: 'none', xl: 'flex' }}
                    colorScheme="brand"
                    borderRadius="25px"
                    color="brand.500"
                    textTransform={'none'}
                    letterSpacing="0px"
                    px="8px"
                  >
                    PRO
                  </Badge>
                </Link>
              </Flex>
            </Box>
          </MenuList>
        </Menu>
        <Button
          variant="transparent"
          border="1px solid"
          borderColor={borderColor}
          borderRadius="full"
          w="34px"
          h="34px"
          px="0px"
          minW="34px"
          justifyContent={'center'}
          alignItems="center"
          onClick={handleLogout}
        >
          <Icon as={FiLogOut} width="16px" height="16px" color="inherit" />
        </Button>
      </Flex>
    </Flex>
  );
}

export default SidebarContent;
