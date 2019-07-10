#include <stdafx.h>
#include "user_message.h"

#include <message_manager.h>

using namespace smp;

namespace
{

class my_mainmenu_commands : public mainmenu_commands
{
public:
    my_mainmenu_commands();

    t_uint32 get_command_count() override;
    GUID get_command( t_uint32 p_index ) override;
    void get_name( t_uint32 p_index, pfc::string_base& p_out ) override;
    bool get_description( t_uint32 p_index, pfc::string_base& p_out ) override;
    GUID get_parent() override;
    void execute( t_uint32 p_index, service_ptr_t<service_base> p_callback ) override;
    bool get_display( t_uint32 p_index, pfc::string_base& p_out, t_uint32& p_flags ) override;

private:
    const std::array<GUID, 10> menuObjects_;
};

} // namespace

namespace
{

my_mainmenu_commands::my_mainmenu_commands()
    : menuObjects_{ g_guid_smp_menu_one,
                    g_guid_smp_menu_two,
                    g_guid_smp_menu_three,
                    g_guid_smp_menu_four,
                    g_guid_smp_menu_five,
                    g_guid_smp_menu_six,
                    g_guid_smp_menu_seven,
                    g_guid_smp_menu_eight,
                    g_guid_smp_menu_nine,
                    g_guid_smp_menu_ten }
{
}

t_uint32 my_mainmenu_commands::get_command_count()
{
    return menuObjects_.size();
}
GUID my_mainmenu_commands::get_command( t_uint32 p_index )
{
    if ( p_index >= menuObjects_.size() )
    {
        uBugCheck();
        return pfc::guid_null;
    }

    return menuObjects_[p_index];
}
void my_mainmenu_commands::get_name( t_uint32 p_index, pfc::string_base& p_out )
{
    if ( p_index >= menuObjects_.size() )
    {
        uBugCheck();
    }

    p_out.reset();
    p_out << ( p_index + 1 );
}
bool my_mainmenu_commands::get_description( t_uint32 /* p_index */, pfc::string_base& p_out )
{
    p_out = "Invoke on_main_menu()";
    return true;
}
GUID my_mainmenu_commands::get_parent()
{
    return g_guid_smp_mainmenu_group_id;
}
void my_mainmenu_commands::execute( t_uint32 p_index, service_ptr_t<service_base> p_callback )
{
    panel::message_manager::instance().post_msg_to_all( static_cast<UINT>( InternalAsyncMessage::main_menu_item ), p_index + 1 );
}
bool my_mainmenu_commands::get_display( t_uint32 p_index, pfc::string_base& p_out, t_uint32& p_flags )
{
    get_name( p_index, p_out );
    p_flags = mainmenu_commands::flag_defaulthidden;
    return true;
}

} // namespace

namespace
{

mainmenu_group_popup_factory g_mainmenu_group(
    g_guid_smp_mainmenu_group_id, mainmenu_groups::file, static_cast<t_uint32>( mainmenu_commands::sort_priority_dontcare ), SMP_NAME );

mainmenu_commands_factory_t<my_mainmenu_commands> g_my_mainmenu_commands_factory;

} // namespace
