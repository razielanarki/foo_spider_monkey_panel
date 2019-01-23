#pragma once

#include <utils/gdi_helpers.h>

namespace smp::error
{

template <typename T, typename T_Parent = T>
void CheckGdiPlusObject( const std::unique_ptr<T>& obj, const T_Parent* pParentObj = nullptr ) noexcept( false )
{
    if ( gdi::IsGdiPlusObjectValid( obj ) )
    {
        return;
    }

    if ( !obj && !pParentObj )
    {
        throw SmpException( "Failed to create GdiPlus object" );
    }

    const auto pObject = ( obj ? obj.get() : pParentObj );
    throw SmpException(
        smp::string::Formatter()
        << "Failed to create GdiPlus object (0x" << std::hex << pObject->GetLastStatus() << ": " << GdiErrorCodeToText( pObject->GetLastStatus() ) );
}

const char* GdiErrorCodeToText( Gdiplus::Status errorCode );
void CheckGdi( Gdiplus::Status gdiStatus, std::string_view functionName );

} // namespace smp::error
